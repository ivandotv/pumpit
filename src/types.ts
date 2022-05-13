import type { Pumpa } from './pumpa'
import { SCOPE, TYPE } from './pumpa'

export type AvailableTypes = keyof typeof TYPE

export type AvailableScopes = keyof typeof SCOPE

export type ResolveCtx = {
  data?: Record<string, any>
}

export type ChildOptions = {
  shareSingletons?: boolean
}

export type BindKey = string | symbol | Record<string, any>

export type ClassOptions<
  T extends new (...args: any[]) => any,
  K extends AvailableScopes = 'TRANSIENT'
> = {
  type: typeof TYPE.CLASS
  scope: K
  beforeResolve?: (data: {
    container: Pumpa
    value: new (...args: ConstructorParameters<T>) => T
    deps?: ConstructorParameters<T>
    ctx?: ResolveCtx
  }) => T
  afterResolve?: (data: {
    container: Pumpa
    value: InstanceType<T>
    ctx?: ResolveCtx
  }) => void
  unbind?: (data: {
    container: Pumpa
    dispose: boolean
    value: K extends 'SINGLETON' ? InstanceType<T> : undefined
  }) => void
}

export type FactoryOptions<
  T extends (...args: any[]) => any,
  K extends AvailableScopes
> = {
  type: typeof TYPE.FACTORY
  scope: K
  beforeResolve?: (data: {
    container: Pumpa
    value: T
    deps?: Parameters<T>
    ctx?: ResolveCtx
  }) => ReturnType<T>
  afterResolve?: (data: {
    container: Pumpa
    value: ReturnType<T>
    ctx?: ResolveCtx
  }) => void
  unbind?: (data: {
    container: Pumpa
    dispose: boolean
    value: K extends 'SINGLETON' ? ReturnType<T> : undefined
  }) => void
}

export type ValueOptions = {
  type: typeof TYPE.VALUE
  scope: typeof SCOPE.SINGLETON
}
