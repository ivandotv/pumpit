import type { PumpIt } from "./pumpit"
import { BindKey, ResolveCtx } from "./types"

//detect transfom action function
export const TRANSFORM_DEPS = Symbol()

//detect injection function
const INJECTION_FN = Symbol()

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

export type InjectionData =
  | Injection[]
  | { action: symbol; fn: (...args: any) => any; deps: Injection[] }

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
  return Boolean(value[INJECTION_FN])
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

/**
 * Wrapper function for registering dependencies that can be manipulated before being injected
 * It gets an array of dependencies in injection order, and it should return an array
 * @param deps - array of dependencies that need to be satisfied see: {@link BindKey | BindKey} {@link get | get()}
 * @param fn - function that will be called with the resolved dependencies
 */
export function transform(
  deps: (BindKey | typeof get)[],
  fn: (data: { container: PumpIt; ctx: ResolveCtx }, ...deps: any[]) => any[],
) {
  return {
    action: TRANSFORM_DEPS,
    fn: fn,
    deps,
  }
}

export function keyToString(key: BindKey) {
  // @ts-expect-error name does not exist on string or symbol
  return String(key.name || key)
}
