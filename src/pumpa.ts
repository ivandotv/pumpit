import { createProxy } from './proxy'
import type { AvailableScopes, AvailableTypes, ChildOptions } from './types'
import {
  ClassOptions,
  ClassPoolData,
  FactoryOptions,
  FactoryPoolData,
  PoolData,
  RequestCtx
} from './types-internal'
import { Injection, InjectionData, parseInjectionData } from './utils'

//track undefined values from factory
const UNDEFINED_RESULT = Symbol()

export const TYPE = {
  VALUE: 'VALUE',
  CLASS: 'CLASS',
  FACTORY: 'FACTORY'
} as const

export const SCOPE = {
  SINGLETON: 'SINGLETON',
  TRANSIENT: 'TRANSIENT',
  REQUEST: 'REQUEST'
} as const

export class Pumpa {
  protected pool: Map<string | symbol, PoolData> = new Map()

  protected singletonCache: Map<string | symbol, any> = new Map()

  protected parent: this | undefined

  protected options: ChildOptions = { shareSingletons: false }

  protected add(key: string | symbol, value: any, info: PoolData): void {
    const dataHit = this.pool.get(key)

    if (dataHit) {
      throw new Error(`Key: ${String(key)} already exists`)
    }
    this.pool.set(key, { ...info, value })
  }

  remove(key: string | symbol, callDispose = true): void {
    const found = this.pool.get(key)

    if (found) {
      this.pool.delete(key)
      const value = this.singletonCache.get(key)
      if (value) {
        this.singletonCache.delete(key)
        const disposeProp = 'dispose'
        if (
          disposeProp in value &&
          typeof value[disposeProp] === 'function' &&
          callDispose
        ) {
          value[disposeProp]()
        }
      }

      return
    }
    throw new Error(`Key: ${String(key)} not found`)
  }

  has(key: string | symbol, searchParent = true): boolean {
    if (searchParent && this.parent) {
      return this.getInjectable(key) ? true : false
    }

    return this.pool.has(key)
  }

  addValue(key: string | symbol, value: any): this {
    this.add(key, value, {
      type: TYPE.VALUE,
      scope: SCOPE.SINGLETON,
      value
    })

    return this
  }

  addFactory<T extends (...args: any[]) => any>(
    key: string | symbol,
    value: T,
    options?: Omit<Partial<FactoryOptions<T>>, 'type'>
  ): this {
    // @ts-expect-error generic constraint mismatch
    this.add(key, value, {
      ...options,
      type: TYPE.FACTORY,
      scope: options?.scope || SCOPE.TRANSIENT,
      value
    })

    return this
  }

  // T extends new (...args: any[]) => T = new (...args: any[]) => any
  addClass<T extends new (...args: any[]) => any>(
    key: string | symbol,
    value: T,
    options?: Omit<Partial<ClassOptions<T>>, 'type'>
  ): this {
    // @ts-expect-error generic constraint mismatch
    this.add(key, value, {
      ...options,
      type: TYPE.CLASS,
      scope: options?.scope || SCOPE.TRANSIENT,
      value
    })

    return this
  }

  child(options: ChildOptions = { shareSingletons: false }): this {
    const child = new (this.constructor as new () => this)()
    child.parent = this
    child.options = options

    return child
  }

  getParent(): Pumpa | undefined {
    return this.parent
  }

  protected getInjectable(
    key: string | symbol
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

  resolve<T>(key: string | symbol): T {
    const ctx: RequestCtx = {
      singletonCache: this.singletonCache,
      transientCache: new Map(),
      requestCache: new Map(),
      requestedKeys: new Map(),
      delayed: new Map()
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

      throw new Error(`Can't resolve lazy key: ${String(key)}`)
    })

    return result
  }

  _resolve(
    key: string | symbol,
    options: { optional?: boolean; lazy?: boolean },
    ctx: RequestCtx
  ): any {
    const data = this.getInjectable(key)

    if (options?.optional === true && !data) {
      return undefined
    }

    if (!data) {
      throw new Error(`Key: ${String(key)} not found`)
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
              `Circular reference detected: ${path} -> [ ${String(key)}: ${
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

  protected createLazy(
    key: string | symbol,
    type: AvailableTypes,
    ctx: RequestCtx
  ) {
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
  >(key: string | symbol, data: ClassPoolData, ctx: RequestCtx): T {
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
  >(key: string | symbol, data: FactoryPoolData, ctx: RequestCtx): T {
    return this.create(key, data, ctx, (value, deps) =>
      // @ts-expect-error - todo narrow the type to FactoryPoolData['value']
      value(...deps)
    )
  }

  protected create(
    key: string | symbol,
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
          ...this.resolveDeps(injectionData.deps, ctx)
        )
      }
    }

    const result = beforeResolve
      ? beforeResolve({
          ctx: this,
          // @ts-expect-error type narrow between factory and class value
          value,
          deps: resolvedDeps
        })
      : create(value, resolvedDeps)

    afterResolve ? afterResolve({ value: result }) : null

    ctx.requestedKeys.get(key)!.constructed = true

    return result
  }

  protected run(
    scope: AvailableScopes,
    key: string | symbol,
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
