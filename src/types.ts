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

export type FactoryValue = {
  value: (...args: any[]) => any
  inject: InjectionData
}

export type ClassValue = {
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
