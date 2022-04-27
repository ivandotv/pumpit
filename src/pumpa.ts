import { createProxy } from './proxy'
import { Injection, InjectionData, parseInjectionData } from './utils'

const TYPES = {
  VALUE: 'VALUE',
  CLASS: 'CLASS',
  FACTORY: 'FACTORY'
} as const

export const SCOPES = {
  SINGLETON: 'SINGLETON',
  TRANSIENT: 'TRANSIENT',
  REQUEST: 'REQUEST'
} as const

type AvailableTypes = keyof typeof TYPES
type AvailableScopes = keyof typeof SCOPES
type Injectable = {
  value: any
  type: AvailableTypes
  scope: AvailableScopes
}

type RequestCtx = {
  singletonCache: Map<string | symbol, any>
  requestCache: Map<string | symbol, any>
  transientCache: Map<string | symbol, any>
  requestedKeys: Map<string | symbol, { constructed: boolean; value: any }>
  delayed: Map<
    string | symbol,
    {
      proxy: Record<string, any>
      proxyTarget: Record<string, { current: any }> | { (): any; current: any }
    }
  >
}

type ChildOptions = {
  shareSingletons?: boolean
}

export class Pumpa {
  protected pool: Map<
    string | symbol,
    { value: any; type: AvailableTypes; scope: AvailableScopes }
  > = new Map()

  protected singletonCache: Map<string | symbol, any> = new Map()

  protected parent: this | undefined

  protected options: ChildOptions = { shareSingletons: false }

  protected add(
    key: string | symbol,
    value: any,
    info: { type: AvailableTypes; scope: AvailableScopes }
  ): void {
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
      type: TYPES.VALUE,
      scope: SCOPES.SINGLETON
    })

    return this
  }

  addFactory(
    key: string | symbol,
    value: (...args: any[]) => (...args: any[]) => any,
    options?: { scope: AvailableScopes; optional?: boolean }
  ): this {
    this.add(key, value, {
      ...options,
      type: TYPES.FACTORY,
      scope: options?.scope || SCOPES.TRANSIENT
    })

    return this
  }

  addClass(
    key: string | symbol,
    value: any,
    options?: { scope: AvailableScopes; optional?: boolean }
  ): this {
    this.add(key, value, {
      ...options,
      type: TYPES.CLASS,
      scope: options?.scope || SCOPES.TRANSIENT
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
  ): { value: Injectable; fromParent: boolean } | undefined {
    const value = this.pool.get(key)
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
    if (type !== TYPES.VALUE) {
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
    if (type === TYPES.VALUE) {
      // resolve immediately - value type has no dependencies
      return value
    }
    if (useLazy) {
      fn = () => this.createLazy(key, type, ctx)
    } else if (type === TYPES.CLASS) {
      fn = () => this.createInstance(key, value, ctx)
    } else {
      fn = () => this.createFactory(key, value, ctx)
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
          if (typeof doneDep === 'undefined' && options.removeUndefined) {
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
    const proxyTarget = type === TYPES.CLASS ? {} : function () {}
    const proxy = createProxy(proxyTarget, type === TYPES.CLASS, key)

    ctx.delayed.set(key, {
      proxy,
      proxyTarget
    })

    return proxy
  }

  protected createInstance<T>(
    key: string | symbol,
    value: {
      new (...args: any[]): T
      inject: InjectionData
    },
    ctx: RequestCtx
  ): T {
    const deps = value.inject
    let result

    if (!deps) {
      result = new value()
    } else {
      result = new value(...this.handleInjectionData(deps, ctx))
    }

    ctx.requestedKeys.get(key)!.constructed = true

    return result
  }

  protected handleInjectionData(deps: InjectionData, ctx: RequestCtx) {
    let handler: {
      fn: (...args: any[]) => any
      deps: Injection[]
    } = {
      fn: (...args) => args,
      deps: []
    }

    if (Array.isArray(deps)) {
      handler.deps = deps
    } else {
      handler = deps
      handler.fn = deps.fn
    }

    return handler.fn(...this.resolveDeps(handler.deps, ctx))
  }

  protected createFactory(
    key: string | symbol,
    value: {
      (...args: any[]): any
      inject: any[]
    },
    ctx: RequestCtx
  ): (...args: any) => any {
    const deps = value.inject as InjectionData[]
    let result
    if (deps) {
      result = value(...this.resolveDeps(deps, ctx))
    } else {
      result = value()
    }
    ctx.requestedKeys.get(key)!.constructed = true

    return result
  }

  protected run(
    scope: AvailableScopes,
    key: string | symbol,
    fn: (...args: any[]) => any,
    ctx: RequestCtx
  ) {
    if (scope === SCOPES.SINGLETON) {
      //if singleton and key is on the parent resolve the key via parent
      if (!this.pool.has(key) && this.options.shareSingletons) {
        return this.parent?.resolve(key)
      }
      const cachedValue = ctx.singletonCache.get(key)
      if (cachedValue) {
        return cachedValue
      } else {
        const result = fn()
        this.singletonCache.set(key, result)

        return result
      }
    }
    if (SCOPES.REQUEST === scope) {
      const cachedValue = ctx.requestCache.get(key)
      if (cachedValue) {
        return cachedValue
      } else {
        const result = fn()
        ctx.requestCache.set(key, result)

        return result
      }
    }

    const result = fn()

    ctx.transientCache.set(key, result)

    return result
  }
}
