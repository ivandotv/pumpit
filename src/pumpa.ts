import { InjectionData, parseInjectionData } from './utils'

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

export class Pumpa {
  protected data: Map<
    string,
    { value: any; type: AvailableTypes; scope: AvailableScopes }
  > = new Map()

  protected permanentCache: Map<string | symbol, any> = new Map()

  protected add(
    key: string,
    value: any,
    info: { type: AvailableTypes; scope: AvailableScopes }
  ): void {
    const dataHit = this.data.get(key)

    if (dataHit) {
      throw new Error(`Key: ${key} already exists`)
    }
    this.data.set(key, { ...info, value })
  }

  addValue(key: string, value: any): this {
    this.add(key, value, {
      type: TYPES.VALUE,
      scope: SCOPES.SINGLETON
    })

    return this
  }

  addFactory(
    key: string,
    value: (...args: any[]) => (...args: any[]) => any,
    options?: { scope: AvailableScopes; optional?: boolean }
  ) {
    this.add(key, value, {
      ...options,
      type: TYPES.FACTORY,
      scope: options?.scope || SCOPES.TRANSIENT
    })

    return this
  }

  addClass(
    key: string,
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

  resolve<T>(key: string): T {
    const requestCache = new Map()

    const result = this._resolve(key, requestCache, { optional: false })

    requestCache.clear()

    return result
  }

  _resolve(
    key: string,
    requestCache: Map<string | symbol, any>,
    options: { optional?: boolean }
  ): any {
    const data = this.data.get(key)

    if (options?.optional === true && !data) {
      return undefined
    }

    if (!data) {
      throw new Error(`Key: ${key} not found`)
    }

    const { type, value, scope } = data

    if (type === TYPES.VALUE) {
      // resolve immediately - singleton
      return value
    } else if (type === TYPES.CLASS) {
      return this.run(scope, key, requestCache, () =>
        this.createInstance(value, requestCache)
      )
    }

    return this.run(scope, key, requestCache, () =>
      this.createFactory(value, requestCache)
    )
  }

  protected resolveDeps(
    deps: InjectionData[],
    requestCache: Map<string | symbol, any>
  ): any[] {
    const finalDeps = []
    for (const dep of deps) {
      const { key, options } = parseInjectionData(dep)
      if (Array.isArray(key)) {
        //resolve array of injection keys

        const nested = []
        for (const k of key) {
          const doneDep = this._resolve(k.key, requestCache, k.options)
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
        const doneDep = this._resolve(key, requestCache, {
          optional: options?.optional
        })
        finalDeps.push(doneDep)
      }
    }

    return finalDeps
  }

  protected createInstance<T>(
    value: {
      new (...args: any[]): T
      inject: any[]
    },
    requestCache: Map<string | symbol, any>
  ): T {
    const deps = value.inject as InjectionData[]

    if (deps) {
      return new value(...this.resolveDeps(deps, requestCache))
    } else {
      return new value()
    }
  }

  protected createFactory(
    value: {
      (...args: any[]): any
      inject: any[]
    },
    requestCache: Map<string | symbol, any>
  ): (...args: any) => any {
    const deps = value.inject as InjectionData[]

    if (deps) {
      return value(...this.resolveDeps(deps, requestCache))
    } else {
      return value()
    }
  }

  protected run(
    scope: AvailableScopes,
    key: string | symbol,
    requestCache: Map<string | symbol, any>,
    fn: (...args: any[]) => any
  ) {
    if (scope === SCOPES.SINGLETON) {
      const cachedValue = this.permanentCache.get(key)
      if (cachedValue) {
        return cachedValue
      } else {
        const result = fn()
        this.permanentCache.set(key, result)

        return result
      }
    }
    if (SCOPES.REQUEST === scope) {
      const cachedValue = requestCache.get(key)
      if (cachedValue) {
        return cachedValue
      } else {
        const result = fn()
        requestCache.set(key, result)

        return result
      }
    }

    return fn()
  }
}
