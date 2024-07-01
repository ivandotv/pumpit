import type { PumpIt } from "./pumpit"
import type { SCOPE, TYPE } from "./pumpit"
import type { InjectionData } from "./utils"

/** Available types that can be binded*/
export type AvailableTypes = keyof typeof TYPE

/** Available scopes that can be used*/
export type AvailableScopes = keyof typeof SCOPE

/** Resolve context that is used per request and passed to the callbacks*/
export type ResolveCtx = Record<string, any>

/** Type of values that can be used for the bind key*/
export type BindKey = string | symbol | Record<string, any>

export type FactoryValue =
  // | ((...args: any[]) => any)
  { value: (...args: any[]) => any; inject: InjectionData }

export type ClassValue =
  // | (new (
  //     ...args: any[]
  //   ) => any)
  { value: new (...args: any[]) => any; inject: InjectionData }

/** Class bind options*/
export type ClassOptions = {
  /** Class constant type {@link AvailableTypes} */
  type: typeof TYPE.CLASS
  /** Scope that is going to be used {@link AvailableScopes}*/
  scope: AvailableScopes
  /** callback that is called before the value is removed from the container. This is only executed for values that are SINGLETONS*/
  unbind?: (data: {
    /** injection container that holds the class instance*/
    container: PumpIt
    /** if dispose method will be called on the class instance*/
    dispose: boolean
    /** instance value that will be removed*/
    value: any
  }) => void
}

export type FactoryOptions = {
  /** Factory constant type */
  type: typeof TYPE.FACTORY
  /** Scope that is going to be used {@link AvailableScopes}*/
  scope: AvailableScopes
  /** callback that is called before the value is removed from the container. This is only executed for values that are SINGLETONS*/
  unbind?: (data: {
    /** injection container that holds the class instance*/
    container: PumpIt
    /** if dispose method will be called on the class instance*/
    dispose: boolean
    /** value that is going to be removed*/
    value: any
  }) => void
}
