import type { PumpIt } from './pumpit'
import { SCOPE, TYPE } from './pumpit'

/** Available types that can be binded*/
export type AvailableTypes = keyof typeof TYPE

/** Available scopes that can be used*/
export type AvailableScopes = keyof typeof SCOPE

/** Resolve context that is used per request and passed to the callbacks*/
export type ResolveCtx = {
  /** Arbitrary data that can be used*/
  data?: Record<string, any>
}

/** Child injector options*/
export type ChildOptions = {
  /** If singleton values should be satisfied by looking at the parent singleton values*/
  shareSingletons?: boolean
}

/** Type of values that can be used for the bind key*/
export type BindKey = string | symbol | Record<string, any>

/** Class bind options*/
export type ClassOptions<
  T extends new (...args: any[]) => any,
  K extends AvailableScopes = 'TRANSIENT'
> = {
  /** Class constant type {@link AvailableTypes} */
  type: typeof TYPE.CLASS
  /** Scope that is going to be used {@link AvailableScopes}*/
  scope: K
  /** callback that is called before the value is resolved, number of calls depends on scope used when registering*/
  beforeResolve?: (data: {
    /** injection container that holds the value*/
    container: PumpIt
    /** constructor that is going to be used */
    value: new (...args: ConstructorParameters<T>) => T
    /** deps that are resolved and should be passed to the constructor*/
    deps?: ConstructorParameters<T>
    /** {@link ResolveCtx | context} object that was passed in with the {@link PumpIt.resolve | PumpIt.resolve} call*/
    ctx?: ResolveCtx
  }) => T
  /** callback that is called after the value is resolved, number of calls depends on scope used when registering*/
  afterResolve?: (data: {
    /** injection container that holds the value*/
    container: PumpIt
    /** value that has been constructed*/
    value: InstanceType<T>
    /** {@link ResolveCtx | context} object that was passed in with the {@link PumpIt.resolve | PumpIt.resolve} call*/
    ctx?: ResolveCtx
  }) => void
  /** callback that is called before the value is removed from the container. This is only executed for values that are SINGLETONS*/
  unbind?: (data: {
    /** injection container that holds the class instance*/
    container: PumpIt
    /** if dispose method will be called on the class instance*/
    dispose: boolean
    /** instance value that will be removed*/
    value: K extends 'SINGLETON' ? InstanceType<T> : undefined
  }) => void
}

export type FactoryOptions<
  T extends (...args: any[]) => any,
  K extends AvailableScopes
> = {
  /** Factory constant type */
  type: typeof TYPE.FACTORY
  /** Scope that is going to be used {@link AvailableScopes}*/
  scope: K
  /** callback that is called before the value is resolved, number of calls depends on scope used when registering*/
  beforeResolve?: (data: {
    /** injection container that holds the value*/
    container: PumpIt
    /** factory function that is going to be used */
    value: T
    /** deps that are resolved and should be passed to the factory function*/
    deps?: Parameters<T>
    /** {@link ResolveCtx | context} object that was passed in with the {@link PumpIt.resolve | PumpIt.resolve} call*/
    ctx?: ResolveCtx
  }) => ReturnType<T>
  /** callback that is called after the value is resolved, number of calls depends on scope used when registering*/
  afterResolve?: (data: {
    /** injection container that holds the value*/
    container: PumpIt
    /** value that has been returned from the factory function call*/
    value: ReturnType<T>
    /** {@link ResolveCtx | context} object that was passed in with the {@link PumpIt.resolve | PumpIt.resolve} call*/
    ctx?: ResolveCtx
  }) => void
  /** callback that is called before the value is removed from the container. This is only executed for values that are SINGLETONS*/
  unbind?: (data: {
    /** injection container that holds the class instance*/
    container: PumpIt
    /** if dispose method will be called on the class instance*/
    dispose: boolean
    /** value that was returned by the factory function and it is going to be removed.*/
    value: K extends 'SINGLETON' ? ReturnType<T> : undefined
  }) => void
}
