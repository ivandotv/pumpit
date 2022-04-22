import { normalizeGet } from './utils'

const TYPES = {
  VALUE: 'VALUE',
  CLASS: 'CLASS',
  CONSTRUCTOR: 'CONSTRUCTOR'
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

  protected singletonCache: Map<string | symbol, any> = new Map()

  protected addData(
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

  bindValue(key: string, value: any): this {
    this.addData(key, value, {
      type: TYPES.VALUE,
      scope: SCOPES.SINGLETON
    })

    return this
  }

  bindClass(
    key: string,
    value: any,
    options?: { scope: AvailableScopes; optional?: boolean }
  ): this {
    this.addData(key, value, {
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

    if (options.optional === true && !data) {
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
      if (scope === SCOPES.SINGLETON) {
        const cachedValue = this.singletonCache.get(key)
        if (cachedValue) {
          return cachedValue
        } else {
          const result = this.createInstance(value, requestCache)
          this.singletonCache.set(key, result)

          return result
        }
      }
      if (SCOPES.REQUEST === scope) {
        const cachedValue = requestCache.get(key)
        if (cachedValue) {
          return cachedValue
        } else {
          const result = this.createInstance(value, requestCache)
          requestCache.set(key, result)

          return result
        }
      }

      // no caching
      return this.createInstance(value, requestCache)
    }
  }

  protected createInstance<T>(
    value: new (...args: any[]) => T,
    requestCache: Map<string | symbol, any>
  ): any {
    // @ts-expect-error - static inject
    const deps = value.inject as
      | string
      | (() => { key: string; tag?: string; optional?: boolean })[]

    if (deps) {
      const finalDeps = this.resolveDeps(deps, requestCache)
      const result = new value(...finalDeps)

      return result
    } else {
      return new value()
    }
  }

  protected resolveDeps(
    deps: string | (() => { key: string; options?: { optional?: boolean } })[],
    requestCache: Map<string | symbol, any>
  ): any[] {
    const finalDeps = []
    for (const dep of deps) {
      const { key, options } = normalizeGet(dep)
      const doneDep = this._resolve(key, requestCache, {
        optional: options?.optional
      })
      finalDeps.push(doneDep)
    }

    return finalDeps
  }
}
