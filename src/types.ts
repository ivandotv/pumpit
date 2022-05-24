import type { PumpIt } from './pumpit'
import { SCOPE, TYPE } from './pumpit'
import { InjectionData } from './utils'

/** Available types that can be binded*/
export type AvailableTypes = keyof typeof TYPE

/** Available scopes that can be used*/
export type AvailableScopes = keyof typeof SCOPE

/** Resolve context that is used per request and passed to the callbacks*/
export type ResolveCtx = Record<string, any>

/** Child injector options*/
export type ChildOptions = {
  /** If singleton values should be satisfied by looking at the parent singleton values*/
  shareSingletons?: boolean
}

/** Type of values that can be used for the bind key*/
export type BindKey = string | symbol | Record<string, any>

export type FactoryValue =
  | ((...args: any[]) => any)
  | { value: (...args: any[]) => any; inject: InjectionData }

export type ClassValue =
  | (new (...args: any[]) => any)
  | { value: new (...args: any[]) => any; inject: InjectionData }

/** Class bind options*/
export type ClassOptions<
  T extends ClassValue,
  K extends AvailableScopes = 'TRANSIENT'
> = {
  /** Class constant type {@link AvailableTypes} */
  type: typeof TYPE.CLASS
  /** Scope that is going to be used {@link AvailableScopes}*/
  scope: K
  /** callback that is called before the value is resolved, number of calls depends on scope used when registering*/
  beforeResolve?: (
    data: {
      /** injection container that holds the value*/
      container: PumpIt
      /** constructor that is going to be used */
      value: T extends new (...args: any[]) => any
        ? new (...args: ConstructorParameters<T>) => T
        : // @ts-expect-error - index signature mismatch
          new (...args: ConstructorParameters<T['value']>) => T['value']
      /** {@link ResolveCtx | context} object that was passed in with the {@link PumpIt.resolve | PumpIt.resolve} call*/
      ctx?: ResolveCtx
    },
    /** deps that are resolved and should be passed to the constructor*/
    ...deps: T extends new (...args: any[]) => any
      ? ConstructorParameters<T>
      : // @ts-expect-error - index signature mismatch
        ConstructorParameters<T['value']>
  ) => any
  /** callback that is called after the value is resolved, number of calls depends on scope used when registering*/
  afterResolve?: (data: {
    /** injection container that holds the value*/
    container: PumpIt
    /** value that has been constructed*/
    value: any
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
    value: K extends 'SINGLETON' ? any : undefined
  }) => void
}

export type FactoryOptions<
  T extends FactoryValue,
  K extends AvailableScopes
> = {
  /** Factory constant type */
  type: typeof TYPE.FACTORY
  /** Scope that is going to be used {@link AvailableScopes}*/
  scope: K
  /** callback that is called before the value is resolved, number of calls depends on scope used when registering*/
  beforeResolve?: (
    data: {
      /** injection container that holds the value*/
      container: PumpIt
      /** factory function that is going to be used */
      // @ts-expect-error index type mismatch
      value: T extends (...args: any[]) => any ? T : T['value']
      /** {@link ResolveCtx | context} object that was passed in with the {@link PumpIt.resolve | PumpIt.resolve} call*/
      ctx?: ResolveCtx
    },
    /** deps that are resolved and should be passed to the factory function*/
    ...deps: T extends (...args: any[]) => any
      ? Parameters<T>
      : // @ts-expect-error index type mismatch
        Parameters<T['value']>
  ) => any
  /** callback that is called after the value is resolved, number of calls depends on scope used when registering*/
  afterResolve?: (data: {
    /** injection container that holds the value*/
    container: PumpIt
    /** value that has been returned from the factory function call*/
    value: any
    /** {@link ResolveCtx | context} object that was passed in with the {@link PumpIt.resolve | PumpIt.resolve} call*/
    ctx?: ResolveCtx
  }) => void
  /** callback that is called before the value is removed from the container. This is only executed for values that are SINGLETONS*/
  unbind?: (data: {
    /** injection container that holds the class instance*/
    container: PumpIt
    /** if dispose method will be called on the class instance*/
    dispose: boolean
    /** value that is going to be removed*/
    value: K extends 'SINGLETON' ? any : undefined
  }) => void
}
