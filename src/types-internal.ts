import { Pumpa, SCOPE, TYPE } from './pumpa'
import type { AvailableScopes } from './types'
import { InjectionData } from './utils'

export type RequestCtx = {
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

export type ClassOptions<
  T extends new (...args: any[]) => T = new (...args: any[]) => any
> = {
  type: typeof TYPE.CLASS
  scope: AvailableScopes
  beforeResolve?: (data: {
    ctx: Pumpa
    value: new (...args: ConstructorParameters<T>) => T
    deps?: ConstructorParameters<T>
  }) => T
  afterResolve?: (data: { value: InstanceType<T> }) => void
}

export type FactoryOptions<
  T extends (...args: any[]) => any = (...args: any[]) => any
> = {
  type: typeof TYPE.FACTORY
  scope: AvailableScopes
  beforeResolve?: (data: {
    ctx: Pumpa
    value: T
    deps?: Parameters<T>
  }) => ReturnType<T>
  afterResolve?: (value: ReturnType<T>) => void
}

export type ValueOptions = {
  type: typeof TYPE.VALUE
  scope: typeof SCOPE.SINGLETON
}

export type ClassPoolData = ClassOptions & {
  value: { new (...args: any[]): any; inject?: InjectionData }
}

export type ValuePoolData = ValueOptions & { value: any }

export type FactoryPoolData = FactoryOptions & {
  value: { (...args: any[]): any; inject?: InjectionData }
}

export type PoolData = ValuePoolData | ClassPoolData | FactoryPoolData
