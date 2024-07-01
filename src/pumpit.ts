import { PumpitError } from "./pumpit-error"
import type {
  AvailableScopes,
  BindKey,
  ClassOptions,
  ClassValue,
  FactoryOptions,
  FactoryValue,
  ResolveCtx,
} from "./types"
import type { RequestCtx } from "./types-internal"
import type { ClassPoolData, FactoryPoolData, PoolData } from "./types-internal"
import {
  INJECT_KEY,
  type Injection,
  keyToString,
  parseInjectionData,
} from "./utils"

//track undefined values from the factory
const UNDEFINED_RESULT = Symbol()

const DISPOSE_PROP = "dispose"
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

export class PumpIt {
  protected pool: Map<BindKey, PoolData> = new Map()

  protected singletonCache: Map<BindKey, any> = new Map()

  protected parent: this | undefined

  protected currentCtx: RequestCtx | null = null

  protected name?: string

  protected locked = false

  constructor(name?: string) {
    this.name = name
  }

  /**
   * Gets the name of the container
   * @returns The name of the object.
   */
  getName() {
    return this.name
  }

  protected add(key: BindKey, value: any, info: PoolData): void {
    if (this.locked) {
      throw new Error("Container is locked")
    }
    const dataHit = this.pool.get(key)

    if (dataHit) {
      throw new Error(`Key: ${keyToString(key)} already exists`)
    }
    this.pool.set(key, { ...info, value })
  }

  /**
   * Unbinds a dependency from the container.
   * @param key - The key to unbind.
   * @param dispose - Optional. Specifies whether to call dispose method if available. Default is `true`.
   * @throws {Error} If the container is locked or if the key is not found.
   */
  unbind(key: BindKey, dispose = true): void {
    if (this.locked) {
      throw new Error("Container is locked")
    }
    const poolData = this.pool.get(key)

    if (poolData) {
      const singleton = this.singletonCache.get(key)
      this.pool.delete(key)
      this.singletonCache.delete(key)

      if (singleton && dispose) {
        this.callDispose(singleton)
      }

      return
    }
    throw new Error(`Key: ${keyToString(key)} not found`)
  }

  /**
   * Unbinds all dependencies from the container.
   * @param callDispose - Whether to call the `dispose` method on each unbound dependency. Default is `true`
   *
   */
  unbindAll(callDispose = true) {
    for (const key of this.pool.keys()) {
      this.unbind(key, callDispose)
    }
    this.pool.clear()
    this.singletonCache.clear()
  }

  protected callDispose(value: any) {
    if (
      typeof value !== "symbol" &&
      DISPOSE_PROP in value &&
      typeof value[DISPOSE_PROP] === "function"
    ) {
      value[DISPOSE_PROP]()
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
    if (searchParent && this.parent) {
      return !!this.getInjectable(key)
    }

    return this.pool.has(key)
  }

  /**
   * Binds value. Value is treated as a singleton and ti will always resolve to the same data (value)
   *
   * @param key - key to resolve binded value {@link BindKey}
   * @param value - value to bind
   * @returns current pumpIt instance
   */
  bindValue<T>(key: BindKey, value: T): this {
    this.add(key, value, {
      type: TYPE.VALUE,
      scope: SCOPE.SINGLETON,
      value,
    })

    return this
  }

  /**
   * Binds a factory function. Function that is binded will be executed when resolved and the value will be returned.
   * Number of executions depends on the scope used.
   *
   * @param key - key to resolve binded value {@link BindKey | BindKey}
   * @param value - factory function to bind
   * @param options - bind options {@link FactoryOptions | FactoryOptions}
   */
  bindFactory<T extends FactoryValue>(
    key: BindKey,
    value: T,
    options?: Omit<Partial<FactoryOptions>, "type">,
  ): this {
    const { exec, inject } = this.parseValue(value)

    const resolve = (...args: any[]) => {
      // @ts-expect-error - type narrow
      return exec(...args)
    }
    resolve.inject = inject
    resolve.original = exec

    this.add(key, resolve, {
      ...options,
      type: TYPE.FACTORY,
      scope: options?.scope || SCOPE.TRANSIENT,
      value,
    })

    return this
  }

  protected parseValue(value: ClassValue | FactoryValue) {
    return {
      exec: typeof value !== "function" ? value.value : value,
      // @ts-expect-error type narrow
      inject: value[INJECT_KEY] || value.inject,
    }
  }

  /**
   * Binds class. Class constructor that is binded will be executed with the "new" call when resolved. Number of executions
   * depends on the scope used.
   *
   * @param key - key to resolve binded value {@link BindKey}
   * @param value - class to bind
   * @param options - bind options for factory {@link ClassOptions | ClassOptions}
   */
  bindClass<T extends ClassValue>(
    key: BindKey,
    value: T,
    options?: Omit<Partial<ClassOptions>, "type">,
  ): this {
    const { exec, inject } = this.parseValue(value)
    const resolve = (...args: any[]) => {
      // @ts-expect-error type narrow
      return new exec(...args)
    }
    resolve.inject = inject
    resolve.original = exec

    this.add(key, resolve, {
      ...options,
      type: TYPE.CLASS,
      scope: options?.scope || SCOPE.TRANSIENT,
      value,
    })

    return this
  }

  /**
   * Resolve value that has previously been binded.
   *
   * @typeParam T - value that is going to be resolved
   * @param key - key to search for {@link BindKey | BindKey}
   * @param opts - options for the current resolve request {@link ResolveCtx | ResolveCtx}
   */
  resolve<T>(key: BindKey, opts?: ResolveCtx): T {
    const ctx: RequestCtx = this.currentCtx || {
      singletonCache: this.singletonCache,
      transientCache: new Map(),
      requestCache: new Map(),
      requestedKeys: new Map(),
      postConstruct: [],
      ctx: opts,
    }

    const result = this._resolve(key, {}, ctx)

    // Execute postConstruct functions
    for (const value of ctx.postConstruct) {
      value.postConstruct()
    }

    this.currentCtx = null

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
   * Gets parent injector instance
   */
  getParent(): PumpIt | undefined {
    return this.parent
  }

  protected getInjectable(
    key: BindKey,
  ): { value: PoolData; fromParent: boolean } | undefined {
    // biome-ignore lint/style/noNonNullAssertion: map
    const value = this.pool.get(key)!
    if (value) return { value, fromParent: false }

    const parentValue = this.parent?.getInjectable(key)
    if (parentValue) {
      return {
        value: parentValue.value,
        fromParent: true,
      }
    }

    return undefined
  }

  protected _resolve(
    key: BindKey,
    options: { optional?: boolean },
    ctx: RequestCtx,
  ): any {
    const data = this.getInjectable(key)

    if (options?.optional && !data) {
      return undefined
    }

    if (!data) {
      throw new Error(`Key: ${keyToString(key)} not found`)
    }

    const {
      value: { value, scope, type },
    } = data

    if (type === TYPE.VALUE) {
      // resolve immediately - value type has no dependencies
      return value
    }
    const keySeen = ctx.requestedKeys.get(key)

    //if key has been seen
    if (keySeen) {
      //check if it is constructed
      if (!keySeen.constructed) {
        //throw circular reference error
        const previous = Array.from(ctx.requestedKeys.entries()).pop()
        const path = previous
          ? `[ ${String(previous[0])}: ${previous[1].value.name} ]`
          : ""

        throw new Error(
          `Circular reference detected: ${path} -> [ ${keyToString(
            key,
          )}: ${value} ]`,
        )
      }
    } else {
      ctx.requestedKeys.set(key, { constructed: false, value })
    }

    const fn = () =>
      this.create(key, data.value as ClassPoolData | FactoryPoolData, ctx)

    return this.run(scope, key, fn, ctx)
  }

  protected resolveDeps(deps: Injection[], ctx: RequestCtx): any[] {
    const finalDeps = []
    for (const dep of deps) {
      const { key, options } = parseInjectionData(dep)
      let doneDep = ctx.singletonCache.get(key)
      if (doneDep === undefined) {
        doneDep = this._resolve(key, { ...options }, ctx)
      }
      finalDeps.push(doneDep)
    }

    return finalDeps
  }

  protected create(
    key: BindKey,
    data: FactoryPoolData | ClassPoolData,
    ctx: RequestCtx,
  ) {
    const { value, type } = data
    const injectionData = value.inject
    let resolvedDeps: any[] = []

    if (injectionData) {
      resolvedDeps = this.resolveDeps(injectionData, ctx)
    }
    // @ts-expect-error - type narrow
    const result = value(...resolvedDeps)

    // biome-ignore lint/style/noNonNullAssertion: map assertion
    ctx.requestedKeys.get(key)!.constructed = true

    if (type === "CLASS" && "postConstruct" in result) {
      ctx.postConstruct.push(result)
    }

    return result
  }

  protected run(
    scope: AvailableScopes,
    key: BindKey,
    fn: (...args: any[]) => any,
    ctx: RequestCtx,
  ) {
    if (scope === SCOPE.SINGLETON || scope === SCOPE.CONTAINER_SINGLETON) {
      //if singleton and key is on the parent resolve the key via parent
      if (!this.pool.has(key) && scope === SCOPE.SINGLETON) {
        return this.parent?.resolve(key)
      }
      const cachedValue = ctx.singletonCache.get(key)
      if (cachedValue !== undefined) {
        return cachedValue === UNDEFINED_RESULT ? undefined : cachedValue
      }
      let result = fn()

      if (result === undefined) {
        result = UNDEFINED_RESULT
      }
      this.singletonCache.set(key, result)

      return result
    }

    if (SCOPE.REQUEST === scope) {
      const cachedValue = ctx.requestCache.get(key)
      if (cachedValue !== undefined) {
        return cachedValue === UNDEFINED_RESULT ? undefined : cachedValue
      }
      let result = fn()

      if (result === undefined) {
        result = UNDEFINED_RESULT
      }
      ctx.requestCache.set(key, result)

      return result
    }

    //transient scope
    const result = fn()

    //transient cache is only used for proxies
    ctx.transientCache.set(key, result)

    return result
  }

  protected _validate(safe: boolean) {
    const seen = new Set()
    const wantedBy = new Map()

    for (const [bindKey, value] of this.pool.entries()) {
      if (seen.has(bindKey)) {
        return
      }

      seen.add(bindKey)

      const toInject = value.value.inject
      if (toInject) {
        for (const dep of toInject) {
          const data = parseInjectionData(dep)

          seen.add(data.key)
          if (!this.has(data.key)) {
            if (!wantedBy.has(data.key)) {
              wantedBy.set(data.key, [])
            }
            wantedBy.get(data.key).push(bindKey)
          }
        }
      }
    }

    const errors = []
    for (const [key, value] of wantedBy.entries()) {
      if (value.length > 0) {
        errors.push({
          key,
          wantedBy: value,
        })
      }
    }
    const valid = errors.length === 0

    if (!safe && !valid) {
      throw new PumpitError("Validation", errors)
    }

    return {
      valid,
      errors,
    }
  }

  /**
   * Validates the bindings in the container.
   * It will check if all the dependencies that are required by other bindings are present in the container.
   * If the validation fails it will throw an error.
   * It will not instantiate the classes or execute the functions.
   *
   */
  validate() {
    this._validate(false)
  }

  /**
   * Validates the bindings in the container.
   * It will check if all the dependencies that are required by other bindings are present in the container.
   * It will not instantiate the classes or execute the functions.
   *
   * @returns An object containing the validation result.
   */
  validateSafe() {
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
   * @returns {boolean} `true` if the container is locked, `false` otherwise.
   */
  isLocked(): boolean {
    return this.locked
  }
}
