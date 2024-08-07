import type { SCOPE, TYPE } from "./pumpit"
import type { InjectionData } from "./utils"

/** Available types that can be binded*/
export type AvailableTypes = keyof typeof TYPE

/** Available scopes that can be used*/
export type AvailableScopes = keyof typeof SCOPE

/** Type of values that can be used for the bind key*/
export type BindKey = string | symbol | Record<string, any>

export type FactoryValue =
  | ((...args: any[]) => any)
  | {
      value: (...args: any[]) => any
      inject: InjectionData
    }

export type ClassValue =
  | (new (
      ...args: any[]
    ) => any)
  | {
      value: new (...args: any[]) => any
      inject: InjectionData
    }

/** Class bind options*/
export type ClassOptions = {
  /** Class constant type {@link AvailableTypes} */
  type: typeof TYPE.CLASS
  /** Scope that is going to be used {@link AvailableScopes}*/
  scope: AvailableScopes
}

export type FactoryOptions = {
  /** Factory constant type */
  type: typeof TYPE.FACTORY
  /** Scope that is going to be used {@link AvailableScopes}*/
  scope: AvailableScopes
}
