import type { SCOPE, TYPE } from "./pumpit"
import type { InjectionData } from "./utils"

/** Available types that can be binded*/
export type AvailableTypes = keyof typeof TYPE

/** Available scopes that can be used*/
export type AvailableScopes = keyof typeof SCOPE

/** Type of values that can be used for the bind key*/
export type BindKey = string | symbol | Record<string, any>

/** Any constructor the container can instantiate with `new`*/
export type ClassConstructor = new (...args: any[]) => any

/** Any function the container can call to produce a value*/
export type FactoryFn = (...args: any[]) => any

/**
 * Dependencies can also be declared directly on the class or factory via a
 * static (or plain) `inject` property, instead of the `{ value, inject }` form.
 */
export type WithInjectProp = {
  inject?: InjectionData
}

export type FactoryValue =
  | (FactoryFn & WithInjectProp)
  | {
      value: FactoryFn
      inject: InjectionData
    }

export type ClassValue =
  | (ClassConstructor & WithInjectProp)
  | {
      value: ClassConstructor
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

/** A single unresolved dependency reported by the container validation*/
export type ValidationError = {
  /** The key that could not be found in the container */
  key: BindKey
  /** The keys that declare a dependency on {@link ValidationError.key} */
  wantedBy: BindKey[]
}

/** Result of {@link PumpIt.validateSafe | PumpIt.validateSafe()}*/
export type ValidationResult = {
  valid: boolean
  errors: ValidationError[]
}
