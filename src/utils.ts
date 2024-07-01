import type { BindKey } from "./types"

//detect injection function
const INJECTION_FN = Symbol()

export const INJECT_KEY = Symbol()

export type ParsedInjectionData =
  | { key: BindKey; options: { optional?: boolean; lazy?: boolean } } //get
  | {
      key: { key: BindKey; options: { optional?: boolean } }[]
      options: {
        optional?: boolean
        removeUndefined?: boolean
        setToUndefinedIfEmpty?: boolean
      }
    }

export type Injection = BindKey | ReturnType<typeof get>

export type InjectionData = Injection[]

/**
 * get dependency by key
 * @param key - dependency {@link BindKey | BindKey}
 * @param options - options for the resove process
 */
export function get(
  key: BindKey,
  options?: {
    /** if the dependency cannot be resolved *undefined* will be used */
    optional?: boolean
  },
) {
  const getCall = () => {
    return {
      key,
      options: { ...options },
    }
  }

  getCall[INJECTION_FN] = INJECTION_FN

  return getCall
}

function isInjectionFn(value: any): value is ReturnType<typeof get> {
  return !!value[INJECTION_FN]
}

export function parseInjectionData(key: Injection): ParsedInjectionData {
  if (isInjectionFn(key)) {
    const ex = key()

    return {
      key: ex.key,
      options: ex.options || {},
    }
  }

  return { key, options: { optional: false } }
}

export function keyToString(key: BindKey) {
  // @ts-expect-error name does not exist on string or symbol
  return key.name || key.toString()
}

/**
 * Registers the dependencies for a class or function.
 * @param f - The class or function to register the dependencies for.
 * @param deps - An array of dependencies to be injected.
 */
export function registerInjections(
  f:
    | { new (...args: any[]): any }
    | ((...args: any[]) => (...args: any[]) => any),
  deps: unknown[],
): void {
  // @ts-expect-error - no inject property on cls
  f[INJECT_KEY] = deps
}
