import { createProxy } from './proxy'
import type {
  AvailableScopes,
  AvailableTypes,
  BindKey,
  ChildOptions,
  ClassOptions,
  FactoryOptions,
  ResolveCtx
} from './types'
import type { RequestCtx } from './types-internal'
import { ClassPoolData, FactoryPoolData, PoolData } from './types-internal'
import {
  Injection,
  InjectionData,
  keyToString,
  parseInjectionData
} from './utils'

//track undefined values from factory
const UNDEFINED_RESULT = Symbol()

const DISPOSE_PROP = 'dispose'
/** Constants that represent the type of values that can be binded*/
export const TYPE = {
  VALUE: 'VALUE',
  CLASS: 'CLASS',
  FACTORY: 'FACTORY'
} as const

/** Constants that represent the type of scopes that can be used
 * SINGLETON - value is resolved only once
 * TRANSIENT - value is resolved everytime it is requested
 * REQUEST - value is resolved once per request {@link PumpIt.resolve | PumpIt.resolve()}
 */
export const SCOPE = {
  SINGLETON: 'SINGLETON',
  TRANSIENT: 'TRANSIENT',
  REQUEST: 'REQUEST'
} as const

export class PumpIt {
  protected pool: Map<BindKey, PoolData> = new Map()

  protected singletonCache: Map<BindKey, any> = new Map()

  protected parent: this | undefined

  protected currentCtx: RequestCtx | null = null

  protected options: ChildOptions = { shareSingletons: false }

  protected add(key: BindKey, value: any, info: PoolData): void {
    const dataHit = this.pool.get(key)

    if (dataHit) {
      throw new Error(`Key: ${keyToString(key)} already exists`)
    }
    this.pool.set(key, { ...info, value })
  }

  unbind(key: BindKey, dispose = true): void {
    // @ts-expect-error -unbind does not exist on ValueOptions
    const { value, unbind } = this.pool.get(key) ?? {}
    const singleton = this.singletonCache.get(key)
    const payload = {
      dispose,
      container: this,
      value: singleton
    }

    if (value) {
      this.pool.delete(key)
      this.singletonCache.delete(key)

      //call unbind callback
      unbind && unbind(payload)

      if (singleton && dispose) {
        this.callDispose(singleton)
      }

      return
    }
    throw new Error(`Key: ${keyToString(key)} not found`)
  }

  unbindAll(callDispose = true) {
    for (const key of this.pool.keys()) {
      this.unbind(key, callDispose)
    }
    this.pool.clear()
    this.singletonCache.clear()
  }

  clearInstances() {
    for (const value of this.singletonCache.values()) {
      this.callDispose(value)
    }
    this.singletonCache.clear()
  }

  protected callDispose(value: any) {
    if (
      typeof value !== 'symbol' &&
      DISPOSE_PROP in value &&
      typeof value[DISPOSE_PROP] === 'function'
    ) {
      value[DISPOSE_PROP]()
    }
  }

  has(key: BindKey, searchParent = true): boolean {
    if (searchParent && this.parent) {
      return this.getInjectable(key) ? true : false
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
  bindValue(key: BindKey, value: any): this {
    this.add(key, value, {
      type: TYPE.VALUE,
      scope: SCOPE.SINGLETON,
      value
    })

    return this
  }

  /**
   * Binds a factory function. Function that is binded will be executed when resolved and the value will be returned.
   * Number of executions dependes on the scope used.
   *
   * @param key - key to resolve binded value {@link BindKey | BindKey}
   * @param value - factory function to bind
   * @param options - bind options {@link FactoryOptions | FactoryOptions}
   */
  bindFactory<T extends (...args: any[]) => any = (...args: any[]) => any>(
    key: BindKey,
    value: T,
    options?: Omit<Partial<FactoryOptions<T, AvailableScopes>>, 'type'>
  ): this {
    // @ts-expect-error generic constraint problem
    this.add(key, value, {
      ...options,
      type: TYPE.FACTORY,
      scope: options?.scope || SCOPE.TRANSIENT,
      value
    })

    return this
  }

  /**
   * Binds class. Class constructor that is binded will be executed with the "new" call when resolved. Number of executions
   * depends on the scope used.
   *
   * @param key - key to resolve binded value {@link BindKey}
   * @param value - class to bind
   * @param options - bind options for factory {@link ClassOptions | ClassOptions}
   */
  bindClass<
    T extends new (...args: any[]) => any = new (...args: any[]) => any
  >(
    key: BindKey,
    value: T,
    options?: Omit<Partial<ClassOptions<T, AvailableScopes>>, 'type'>
  ): this {
    // @ts-expect-error generic constraint problem
    this.add(key, value, {
      ...options,
      type: TYPE.CLASS,
      scope: options?.scope || SCOPE.TRANSIENT,
      value
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
      delayed: new Map(),
      ctx: opts
    }

    const result = this._resolve(key, { optional: false }, ctx)

    ctx.delayed.forEach((value, key) => {
      const resolvedValue =
        ctx.singletonCache.get(key) ||
        ctx.requestCache.get(key) ||
        ctx.transientCache.get(key)

      if (resolvedValue) {
        value.proxyTarget.current = resolvedValue

        return
      }

      throw new Error(`Can't resolve lazy key: ${keyToString(key)}`)
    })

    this.currentCtx = null

    return result
  }

  /**
   * Creates child PumpIt instance. Child injection instance is connected to the parent instance and it can use
   * parent singleton values.
   *
   * @param options - child injector options {@link ChildOptions | ChildOptions}
   */
  child(options: ChildOptions = { shareSingletons: false }): this {
    const child = new (this.constructor as new () => this)()
    child.parent = this
    child.options = options

    return child
  }

  /**
   * Gets parent injector instance
   */
  getParent(): PumpIt | undefined {
    return this.parent
  }

  protected getInjectable(
    key: BindKey
  ): { value: PoolData; fromParent: boolean } | undefined {
    const value = this.pool.get(key)!
    if (value) return { value, fromParent: false }

    const parentValue = this.parent?.getInjectable(key)
    if (parentValue) {
      return {
        value: parentValue.value,
        fromParent: true
      }
    }

    return undefined
  }

  protected _resolve(
    key: BindKey,
    options: { optional?: boolean; lazy?: boolean },
    ctx: RequestCtx
  ): any {
    const data = this.getInjectable(key)

    if (options?.optional === true && !data) {
      return undefined
    }

    if (!data) {
      throw new Error(`Key: ${keyToString(key)} not found`)
    }

    const {
      value: { value, scope, type },
      fromParent
    } = data

    let useLazy = false

    //values have no circular references
    if (type !== TYPE.VALUE) {
      const keySeen = ctx.requestedKeys.get(key)

      //if key has been seen
      if (keySeen) {
        //check if it is constructed
        if (!keySeen.constructed) {
          // check if using lazy or key is on the paren, then it's ok
          if (options.lazy || fromParent) {
            //delay construction
            useLazy = true
          } else {
            //throw circular reference error
            const previous = Array.from(ctx.requestedKeys.entries()).pop()
            const path = previous
              ? `[ ${String(previous[0])}: ${previous[1].value.name} ]`
              : ''

            throw new Error(
              `Circular reference detected: ${path} -> [ ${keyToString(key)}: ${
                value.name
              } ]`
            )
          }
        }
      } else {
        ctx.requestedKeys.set(key, { constructed: false, value })
      }
    }

    let fn
    if (type === TYPE.VALUE) {
      // resolve immediately - value type has no dependencies
      return value
    }
    if (useLazy) {
      fn = () => this.createLazy(key, type, ctx)
    } else if (type === TYPE.CLASS) {
      fn = () => this.createInstance(key, data.value as ClassPoolData, ctx)
    } else {
      fn = () => this.createFactory(key, data.value as FactoryPoolData, ctx)
    }

    return this.run(scope, key, fn, ctx)
  }

  protected resolveDeps(deps: Injection[], ctx: RequestCtx): any[] {
    const finalDeps = []
    for (const dep of deps) {
      const { key, options } = parseInjectionData(dep)
      if (Array.isArray(key)) {
        //resolve array of injection keys
        const nested = []
        for (const k of key) {
          const doneDep = this._resolve(k.key, { ...k.options }, ctx)
          // @ts-expect-error needs type narrowing for "removeUndefined"
          if (doneDep === undefined && options.removeUndefined) {
            continue
          }
          nested.push(doneDep)
        }
        finalDeps.push(
          nested.length
            ? nested
            : // @ts-expect-error needs type narrowing for "setToUndefinedIfEmpty"
            options.setToUndefinedIfEmpty
            ? undefined
            : nested
        )
      } else {
        const doneDep = this._resolve(key, { ...options }, ctx)
        finalDeps.push(doneDep)
      }
    }

    return finalDeps
  }

  protected createLazy(key: BindKey, type: AvailableTypes, ctx: RequestCtx) {
    const cachedProxy = ctx.delayed.get(key)
    if (cachedProxy) {
      return cachedProxy.proxy
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const proxyTarget = type === TYPE.CLASS ? {} : function () {}
    const proxy = createProxy(proxyTarget, type === TYPE.CLASS, key)

    ctx.delayed.set(key, {
      proxy,
      proxyTarget
    })

    return proxy
  }

  protected createInstance<
    T extends { new (...args: any[]): any; inject: InjectionData }
  >(key: BindKey, data: ClassPoolData, ctx: RequestCtx): T {
    return this.create(
      key,
      data,
      ctx,
      (value, deps) =>
        // @ts-expect-error - todo narrow the type to ClassPoolData['value']
        new value(...deps)
    )
  }

  protected createFactory<
    T extends { (...args: any[]): any; inject: InjectionData }
  >(key: BindKey, data: FactoryPoolData, ctx: RequestCtx): T {
    return this.create(key, data, ctx, (value, deps) =>
      // @ts-expect-error - todo narrow the type to FactoryPoolData['value']
      value(...deps)
    )
  }

  protected create(
    key: BindKey,
    data: FactoryPoolData | ClassPoolData,
    ctx: RequestCtx,
    create: (
      value: FactoryPoolData['value'] | ClassPoolData['value'],
      deps: any[]
    ) => void
  ) {
    const { beforeResolve, afterResolve, value } = data
    const injectionData = value.inject
    let resolvedDeps = []

    if (injectionData) {
      if (Array.isArray(injectionData)) {
        resolvedDeps = this.resolveDeps(injectionData, ctx)
      } else {
        resolvedDeps = injectionData.fn(
          this,
          ...this.resolveDeps(injectionData.deps, ctx),
          ctx.ctx
        )
      }
    }

    const result = beforeResolve
      ? beforeResolve({
          container: this,
          // @ts-expect-error type narrow between factory and class value
          value,
          deps: resolvedDeps,
          ctx: ctx.ctx
        })
      : create(value, resolvedDeps)

    afterResolve
      ? afterResolve({ container: this, value: result, ctx: ctx.ctx })
      : null

    ctx.requestedKeys.get(key)!.constructed = true

    return result
  }

  protected run(
    scope: AvailableScopes,
    key: BindKey,
    fn: (...args: any[]) => any,
    ctx: RequestCtx
  ) {
    if (scope === SCOPE.SINGLETON) {
      //if singleton and key is on the parent resolve the key via parent
      if (!this.pool.has(key) && this.options.shareSingletons) {
        return this.parent?.resolve(key)
      }
      const cachedValue = ctx.singletonCache.get(key)
      if (cachedValue !== undefined) {
        return cachedValue === UNDEFINED_RESULT ? undefined : cachedValue
      } else {
        let result = fn()

        if (result === undefined) {
          result = UNDEFINED_RESULT
        }
        this.singletonCache.set(key, result)

        return result
      }
    }
    if (SCOPE.REQUEST === scope) {
      const cachedValue = ctx.requestCache.get(key)
      if (cachedValue !== undefined) {
        return cachedValue === UNDEFINED_RESULT ? undefined : cachedValue
      } else {
        let result = fn()

        if (result === undefined) {
          result = UNDEFINED_RESULT
        }
        ctx.requestCache.set(key, result)

        return result
      }
    }

    const result = fn()

    //transient cache is only used for proxies
    ctx.transientCache.set(key, result)

    return result
  }
}
