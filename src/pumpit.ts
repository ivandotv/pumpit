import { ERROR_CODE, PumpitError, PumpitValidationError } from "./pumpit-error"
import type {
  AvailableScopes,
  BindKey,
  BindOptions,
  ClassConstructor,
  ClassValue,
  ClassValueFor,
  FactoryValue,
  FactoryValueFor,
  ValidationError,
  ValidationResult,
  ValueBindOptions,
} from "./types"
import type { RequestCtx } from "./types-internal"
import type {
  ClassPoolData,
  FactoryPoolData,
  PoolData,
  ResolverFn,
} from "./types-internal"
import {
  INJECT_KEY,
  type InjectionData,
  type InjectionOptions,
  type ParsedInjectionData,
  type Token,
  keyToString,
  parseInjectionData,
} from "./utils"

//track undefined values from the factory
const UNDEFINED_RESULT = Symbol()

const DISPOSE_PROP = "dispose"

// `Symbol.dispose` only exists on newer runtimes, so it is looked up once and
// treated as optional everywhere else
const DISPOSE_SYMBOL: symbol | undefined =
  typeof Symbol.dispose === "symbol" ? Symbol.dispose : undefined

// shared, never mutated, so the hot path does not allocate an options object
const NO_OPTIONS: InjectionOptions = {}
const OPTIONAL_OPTIONS: InjectionOptions = { optional: true }
const NO_DEPS: any[] = []

/** Constants that represent the type of values that can be binded*/
export const TYPE = {
  VALUE: "VALUE",
  CLASS: "CLASS",
  FACTORY: "FACTORY",
} as const

/** Constants that represent the type of scopes that can be used
 * SINGLETON - value is resolved only once
 * TRANSIENT - value is resolved everytime it is requested
 * REQUEST - value is resolved once per resolve method call {@link PumpIt.resolve | PumpIt.resolve()}
 * CONTAINER_SINGLETON - the child container will create it's own version of the singleton instance
 */
export const SCOPE = {
  /** SINGLETON - value is resolved only once */
  SINGLETON: "SINGLETON",
  /** TRANSIENT - value is resolved everytime it is requested */
  TRANSIENT: "TRANSIENT",
  /** REQUEST - value is resolved once per resolve method call {@link PumpIt.resolve | PumpIt.resolve()}*/
  REQUEST: "REQUEST",
  /** CONTAINER_SINGLETON - the child container will create it's own version of the singleton instance */
  CONTAINER_SINGLETON: "CONTAINER_SINGLETON",
} as const

// biome-ignore lint/suspicious/noUnsafeDeclarationMerging: merged with the `Disposable` interface at the bottom of the file, where the member is installed on the prototype
export class PumpIt {
  protected pool: Map<BindKey, PoolData> = new Map()

  protected singletonCache: Map<BindKey, any> = new Map()

  protected parent: PumpIt | undefined

  protected name: string | undefined

  protected locked = false

  constructor(name?: string) {
    this.name = name
  }

  /**
   * Gets the name of the container
   */
  getName() {
    return this.name
  }

  protected add(key: BindKey, info: PoolData, replace: boolean): void {
    if (this.locked) {
      throw new PumpitError("Container is locked", ERROR_CODE.CONTAINER_LOCKED)
    }

    if (this.pool.has(key)) {
      if (!replace) {
        throw new PumpitError(
          `Key: ${keyToString(key)} already exists`,
          ERROR_CODE.KEY_ALREADY_EXISTS,
        )
      }
      this.unbind(key)
    }

    this.pool.set(key, info)
  }

  /**
   * Unbinds a dependency from the container.
   * @param key - The key to unbind.
   * @param dispose - Optional. Specifies whether to call dispose method if available. Default is `true`.
   * @throws {PumpitError} If the container is locked or if the key is not found.
   */
  unbind(key: BindKey, dispose = true): void {
    if (this.locked) {
      throw new PumpitError("Container is locked", ERROR_CODE.CONTAINER_LOCKED)
    }

    if (!this.pool.has(key)) {
      throw new PumpitError(
        `Key: ${keyToString(key)} not found`,
        ERROR_CODE.KEY_NOT_FOUND,
      )
    }

    // `has` rather than a truthiness check, so falsy singletons are disposed too
    const hasSingleton = this.singletonCache.has(key)
    const singleton = this.singletonCache.get(key)

    this.pool.delete(key)
    this.singletonCache.delete(key)

    if (hasSingleton && dispose) {
      this.callDispose(singleton)
    }
  }

  /**
   * Unbinds all dependencies from the container.
   * @param callDispose - Whether to call the `dispose` method on each unbound dependency. Default is `true`
   * @throws {PumpitError} If the container is locked.
   */
  unbindAll(callDispose = true) {
    if (this.locked) {
      throw new PumpitError("Container is locked", ERROR_CODE.CONTAINER_LOCKED)
    }

    for (const key of this.pool.keys()) {
      this.unbind(key, callDispose)
    }
    this.pool.clear()
    this.singletonCache.clear()
  }

  protected callDispose(value: unknown): void {
    // `in` throws on primitives, so guard on the object shape first
    if (
      (typeof value !== "object" && typeof value !== "function") ||
      value === null
    ) {
      return
    }

    const target = value as Record<PropertyKey, unknown>

    if (DISPOSE_SYMBOL !== undefined) {
      const symbolDispose = target[DISPOSE_SYMBOL]
      if (typeof symbolDispose === "function") {
        symbolDispose.call(value)

        return
      }
    }

    const dispose = target[DISPOSE_PROP]
    if (typeof dispose === "function") {
      dispose.call(value)
    }
  }

  /**
   * Checks if the dependency under the specified key exists in the container.
   *
   * @param key - The key to check for existence.
   * @param searchParent - Optional. Specifies whether to search the parent container if the key is not found in the current container. Default is true.
   * @returns A boolean value indicating whether the key exists in the pool or its parent pool.
   */
  has(key: BindKey, searchParent = true): boolean {
    if (this.pool.has(key)) {
      return true
    }

    return searchParent && this.parent !== undefined
      ? this.parent.has(key, true)
      : false
  }

  /**
   * Lists every key currently bound in the container.
   *
   * @param includeParent - Optional. Also include keys bound on the parent chain,
   * shadowed keys reported once. Default is `false`.
   */
  getKeys(includeParent = false): BindKey[] {
    if (!includeParent || this.parent === undefined) {
      return Array.from(this.pool.keys())
    }

    const keys = new Set<BindKey>(this.pool.keys())
    for (const key of this.parent.getKeys(true)) {
      keys.add(key)
    }

    return Array.from(keys)
  }

  /**
   * Binds value. Value is treated as a singleton and ti will always resolve to the same data (value)
   *
   * @param key - key to resolve binded value {@link BindKey}
   * @param options - bind options {@link ValueBindOptions}
   */
  bindValue<T = unknown, K extends BindKey = BindKey>(
    key: K,
    value: K extends Token<infer V> ? V : T,
    options?: ValueBindOptions,
  ): this
  bindValue(key: BindKey, value: unknown, options?: ValueBindOptions): this {
    this.add(
      key,
      {
        type: TYPE.VALUE,
        scope: SCOPE.SINGLETON,
        value,
      },
      options?.replace ?? false,
    )

    return this
  }

  /**
   * Binds a factory function. Function that is binded will be executed when resolved and the value will be returned.
   * Number of executions depends on the scope used.
   *
   * @param key - key to resolve binded value {@link BindKey}
   * @param options - bind options {@link BindOptions}
   */
  bindFactory<K extends BindKey>(
    key: K,
    value: K extends Token<infer V> ? FactoryValueFor<V> : FactoryValue,
    options?: BindOptions,
  ): this
  bindFactory(key: BindKey, value: FactoryValue, options?: BindOptions): this {
    const { exec, inject } = this.parseValue(value)

    const resolve = ((...args: any[]) => exec(...args)) as ResolverFn
    resolve.inject = inject
    resolve.original = exec

    this.add(
      key,
      {
        type: TYPE.FACTORY,
        scope: options?.scope ?? SCOPE.TRANSIENT,
        value: resolve,
      },
      options?.replace ?? false,
    )

    return this
  }

  /**
   * Binds class. Class constructor that is binded will be executed with the "new" call when resolved. Number of executions
   * depends on the scope used.
   *
   * @param key - key to resolve binded value {@link BindKey}
   * @param options - bind options for the class {@link BindOptions}
   */
  bindClass<K extends BindKey>(
    key: K,
    value: K extends Token<infer V> ? ClassValueFor<V> : ClassValue,
    options?: BindOptions,
  ): this
  bindClass(key: BindKey, value: ClassValue, options?: BindOptions): this {
    const { exec, inject } = this.parseValue(value)

    const resolve = ((...args: any[]) => new exec(...args)) as ResolverFn
    resolve.inject = inject
    resolve.original = exec

    this.add(
      key,
      {
        type: TYPE.CLASS,
        scope: options?.scope ?? SCOPE.TRANSIENT,
        value: resolve,
      },
      options?.replace ?? false,
    )

    return this
  }

  protected parseValue<T extends ClassConstructor | ((...args: any[]) => any)>(
    value: T | { value: T; inject: InjectionData },
  ): { exec: T; inject: ParsedInjectionData[] | undefined } {
    const exec = typeof value === "function" ? value : value.value
    // injections come either from `registerInjections` (symbol keyed) or from
    // an `inject` property on the class/factory itself, or on the wrapper
    const source = value as {
      [INJECT_KEY]?: InjectionData
      inject?: InjectionData
    }

    const raw = source[INJECT_KEY] ?? source.inject

    return {
      exec,
      // injection metadata cannot change once bound, so parse it here rather
      // than on every single resolve
      inject: raw === undefined ? undefined : raw.map(parseInjectionData),
    }
  }

  /**
   * Resolve value that has previously been binded.
   *
   * @typeParam T - value that is going to be resolved
   * @param key - key to search for {@link BindKey}
   * @throws {PumpitError} If the key is not bound.
   */
  resolve<T>(key: Token<T>): T
  resolve<T extends ClassConstructor>(key: T): InstanceType<T>
  resolve<T>(key: BindKey): T
  resolve(key: BindKey): any {
    return this.runResolve(key, NO_OPTIONS)
  }

  /**
   * Same as {@link PumpIt.resolve | PumpIt.resolve()}, except that an unbound
   * key resolves to `undefined` instead of throwing.
   *
   * @param key - key to search for {@link BindKey}
   */
  tryResolve<T>(key: Token<T>): T | undefined
  tryResolve<T extends ClassConstructor>(key: T): InstanceType<T> | undefined
  tryResolve<T>(key: BindKey): T | undefined
  tryResolve(key: BindKey): any {
    return this.runResolve(key, OPTIONAL_OPTIONS)
  }

  protected runResolve(key: BindKey, options: InjectionOptions): any {
    const ctx: RequestCtx = {
      requestCache: undefined,
      stack: undefined,
      postConstruct: undefined,
    }

    const result = this._resolve(key, options, ctx)

    const postConstruct = ctx.postConstruct
    if (postConstruct !== undefined) {
      for (const value of postConstruct) {
        value.postConstruct()
      }
    }

    return result
  }

  /**
   * Creates child PumpIt instance. Child injection instance is connected to the parent instance and it can use
   * parent singleton values.
   *
   */
  child(name?: string): this {
    const child = new (this.constructor as new (name?: string) => this)(name)
    child.parent = this

    return child
  }

  /**
   * Sets the parent PumpIt instance.
   *
   * @param parent - The parent PumpIt instance to be set, or `undefined` to detach.
   * @throws {PumpitError} If the parent would introduce a cycle in the hierarchy.
   */
  setParent(parent: PumpIt | undefined) {
    // without this a cycle turns every lookup into an infinite recursion
    let ancestor = parent
    while (ancestor !== undefined) {
      if (ancestor === this) {
        throw new PumpitError(
          "Parent would create a cycle in the container hierarchy",
          ERROR_CODE.PARENT_CYCLE,
        )
      }
      ancestor = ancestor.parent
    }

    this.parent = parent
  }

  /**
   * Gets parent injector instance
   */
  getParent(): PumpIt | undefined {
    return this.parent
  }

  protected getInjectable(key: BindKey): PoolData | undefined {
    const value = this.pool.get(key)
    if (value !== undefined) {
      return value
    }

    return this.parent?.getInjectable(key)
  }

  protected _resolve(
    key: BindKey,
    options: InjectionOptions,
    ctx: RequestCtx,
  ): any {
    const data = this.getInjectable(key)

    if (data === undefined) {
      if (options.optional) {
        return undefined
      }

      throw new PumpitError(
        `Key: ${keyToString(key)} not found`,
        ERROR_CODE.KEY_NOT_FOUND,
      )
    }

    if (data.type === TYPE.VALUE) {
      // resolve immediately - value type has no dependencies
      return data.value
    }

    return this.run(data.scope, key, data, ctx)
  }

  protected run(
    scope: AvailableScopes,
    key: BindKey,
    data: FactoryPoolData | ClassPoolData,
    ctx: RequestCtx,
  ) {
    if (scope === SCOPE.SINGLETON || scope === SCOPE.CONTAINER_SINGLETON) {
      const parent = this.parent
      // a plain singleton belongs to the container that owns the key, so hand
      // the resolve over to it - but keep the same request context, otherwise
      // request scope, post construct ordering and circular detection would all
      // restart at the boundary
      if (
        scope === SCOPE.SINGLETON &&
        parent !== undefined &&
        !this.pool.has(key)
      ) {
        return parent._resolve(key, NO_OPTIONS, ctx)
      }

      const cached = this.singletonCache.get(key)
      if (cached !== undefined) {
        return cached === UNDEFINED_RESULT ? undefined : cached
      }

      const result = this.create(key, data, ctx)
      this.singletonCache.set(
        key,
        result === undefined ? UNDEFINED_RESULT : result,
      )

      return result
    }

    if (scope === SCOPE.REQUEST) {
      const cache = ctx.requestCache
      if (cache !== undefined) {
        const cached = cache.get(key)
        if (cached !== undefined) {
          return cached === UNDEFINED_RESULT ? undefined : cached
        }
      }

      const result = this.create(key, data, ctx)
      // re-read, creating the value may have populated the cache
      let target = ctx.requestCache
      if (target === undefined) {
        target = new Map()
        ctx.requestCache = target
      }
      target.set(key, result === undefined ? UNDEFINED_RESULT : result)

      return result
    }

    //transient scope
    return this.create(key, data, ctx)
  }

  protected create(
    key: BindKey,
    data: FactoryPoolData | ClassPoolData,
    ctx: RequestCtx,
  ) {
    const { value, type } = data
    const injectionData = value.inject

    let result: any
    if (injectionData !== undefined && injectionData.length > 0) {
      // only bindings with dependencies can take part in a cycle, so the stack
      // is only touched here
      let stack = ctx.stack
      if (stack === undefined) {
        stack = []
        ctx.stack = stack
      }
      if (stack.includes(key)) {
        throw this.circularError(stack, key)
      }

      stack.push(key)
      try {
        result = value(...this.resolveDeps(injectionData, ctx))
      } finally {
        stack.pop()
      }
    } else {
      result = value(...NO_DEPS)
    }

    if (type === TYPE.CLASS && "postConstruct" in result) {
      let hooks = ctx.postConstruct
      if (hooks === undefined) {
        hooks = []
        ctx.postConstruct = hooks
      }
      hooks.push(result)
    }

    return result
  }

  protected resolveDeps(deps: ParsedInjectionData[], ctx: RequestCtx): any[] {
    const finalDeps = []
    for (const dep of deps) {
      finalDeps.push(this._resolve(dep.key, dep.options, ctx))
    }

    return finalDeps
  }

  protected circularError(stack: BindKey[], key: BindKey): PumpitError {
    const path = [...stack, key]
      .map((pathKey) => {
        const data = this.getInjectable(pathKey)
        const name =
          data !== undefined && data.type !== TYPE.VALUE
            ? data.value.original.name
            : undefined

        return name
          ? `[ ${keyToString(pathKey)}: ${name} ]`
          : `[ ${keyToString(pathKey)} ]`
      })
      .join(" -> ")

    return new PumpitError(
      `Circular reference detected: ${path}`,
      ERROR_CODE.CIRCULAR_REFERENCE,
    )
  }

  protected _validate(safe: boolean): ValidationResult {
    const wantedBy = new Map<BindKey, BindKey[]>()

    for (const [bindKey, data] of this.pool.entries()) {
      const toInject = data.type === TYPE.VALUE ? undefined : data.value.inject
      if (toInject === undefined) {
        continue
      }

      for (const dep of toInject) {
        // a missing optional dependency resolves to undefined by design
        if (dep.options.optional || this.has(dep.key)) {
          continue
        }

        let wanted = wantedBy.get(dep.key)
        if (wanted === undefined) {
          wanted = []
          wantedBy.set(dep.key, wanted)
        }
        if (!wanted.includes(bindKey)) {
          wanted.push(bindKey)
        }
      }
    }

    const errors: ValidationError[] = []
    for (const [key, wanted] of wantedBy.entries()) {
      errors.push({
        key,
        wantedBy: wanted,
      })
    }

    if (!safe && errors.length > 0) {
      throw new PumpitValidationError(errors)
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }

  /**
   * Validates the bindings in the container.
   * It will check if all the dependencies that are required by other bindings are present in the container.
   * If the validation fails it will throw an error.
   * It will not instantiate the classes or execute the functions.
   *
   * @throws {PumpitValidationError} If any dependency cannot be resolved.
   */
  validate(): void {
    this._validate(false)
  }

  /**
   * Validates the bindings in the container.
   * It will check if all the dependencies that are required by other bindings are present in the container.
   * It will not instantiate the classes or execute the functions.
   */
  validateSafe(): ValidationResult {
    return this._validate(true)
  }

  /**
   * Locks the container so no more bindings can be added or removed.
   */
  lock() {
    this.locked = true
  }

  /**
   * Checks if the container is locked.
   */
  isLocked(): boolean {
    return this.locked
  }
}

// `using container = new PumpIt()` unbinds everything on scope exit. The method
// is attached to the prototype below rather than declared in the class body,
// because `Symbol.dispose` does not exist on every supported runtime.
export interface PumpIt extends Disposable {}

if (DISPOSE_SYMBOL !== undefined) {
  Object.defineProperty(PumpIt.prototype, DISPOSE_SYMBOL, {
    value: function dispose(this: PumpIt) {
      this.unbindAll()
    },
    writable: true,
    configurable: true,
  })
}
