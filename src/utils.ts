import type { BindKey, ClassConstructor, FactoryFn } from "./types"

//detect injection function
const INJECTION_FN = Symbol()

export const INJECT_KEY = Symbol()

/** Options that control how a single dependency is resolved*/
export type InjectionOptions = {
  /** if the dependency cannot be resolved *undefined* will be used */
  optional?: boolean
}

/** A dependency key plus the options it should be resolved with*/
export type ParsedInjectionData = {
  key: BindKey
  options: InjectionOptions
}

/** The callable returned by {@link get | get()}*/
export type InjectionFn = {
  (): ParsedInjectionData
  // the brand is the presence of the key; TypeScript 7 widens the assigned
  // expando value to `symbol`, so don't pin it to `typeof INJECTION_FN`
  [INJECTION_FN]: symbol
}

export type Injection = BindKey | InjectionFn

export type InjectionData = Injection[]

/** Anything that can carry injection metadata*/
export type Injectable = ClassConstructor | FactoryFn

/**
 * get dependency by key
 * @param key - dependency {@link BindKey}
 * @param options - options for the resolve process
 */
export function get(key: BindKey, options?: InjectionOptions): InjectionFn {
  const getCall = () => {
    return {
      key,
      options: { ...options },
    }
  }

  getCall[INJECTION_FN] = INJECTION_FN

  return getCall
}

function isInjectionFn(value: Injection): value is InjectionFn {
  return typeof value === "function" && INJECTION_FN in value
}

export function parseInjectionData(key: Injection): ParsedInjectionData {
  if (isInjectionFn(key)) {
    const ex = key()

    return {
      key: ex.key,
      options: ex.options ?? {},
    }
  }

  return { key, options: { optional: false } }
}

export function keyToString(key: BindKey): string {
  if (typeof key === "string") {
    return key
  }
  if (typeof key === "symbol") {
    return key.toString()
  }

  return typeof key.name === "string" ? key.name : String(key)
}

/**
 * Registers the dependencies for a class or function.
 * @param f - The class or function to register the dependencies for.
 * @param deps - An array of dependencies to be injected.
 */
export function registerInjections(f: Injectable, deps: InjectionData): void {
  ;(f as Injectable & { [INJECT_KEY]?: InjectionData })[INJECT_KEY] = deps
}
