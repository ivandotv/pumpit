import type { Pumpa } from './pumpa'
import { SCOPE, TYPE } from './pumpa'
export type AvailableTypes = keyof typeof TYPE
export type AvailableScopes = keyof typeof SCOPE
export type ChildOptions = {
  shareSingletons?: boolean
}

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
