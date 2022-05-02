import { IS_PROXY } from './proxy'
import { BindKey } from './types'

//detect transfom action function
export const TRANSFORM_DEPS = Symbol()

//detect injection function
const INJECTION_FN = Symbol()

export type ParsedInjectionData =
  | { key: BindKey; options: { optional?: boolean; lazy?: boolean } } //get
  | {
      key: { key: BindKey; options: { optional?: boolean } }[] //getArray
      options: {
        optional?: boolean
        removeUndefined?: boolean
        setToUndefinedIfEmpty?: boolean
      }
    }

export type Injection =
  | BindKey
  | ReturnType<typeof get>
  | ReturnType<typeof getArray>

export type InjectionData =
  | Injection[]
  | { action: symbol; fn: (...args: any) => any; deps: Injection[] }

export function get(
  key: BindKey,
  options?: {
    optional?: boolean
    lazy?: boolean
  }
) {
  const getCall = () => {
    return {
      key,
      options: { ...options }
    }
  }

  // @ts-expect-error -  using symbol as index type
  getCall[INJECTION_FN] = INJECTION_FN

  return getCall
}

export function getArray(
  deps: (BindKey | ReturnType<typeof get>)[],
  options?: {
    removeUndefined?: boolean
    setToUndefinedIfEmpty?: boolean
  }
) {
  const getArrayCall = () => {
    const result = []
    for (const dep of deps) {
      result.push(parseInjectionData(dep))
    }

    return {
      key: result,
      options: {
        optional: true,
        ...options
      }
    }
  }

  // @ts-expect-error -  using symbol as index type
  getArrayCall[INJECTION_FN] = INJECTION_FN

  return getArrayCall
}

function isInjectionFn(
  value: any
): value is ReturnType<typeof get> | ReturnType<typeof getArray> {
  return Boolean(value[INJECTION_FN])
}

export function parseInjectionData(key: Injection): ParsedInjectionData {
  if (isInjectionFn(key)) {
    const ex = key()

    return {
      key: ex.key,
      options: ex.options || {}
    }
  }

  return { key, options: { optional: false } }
}

export function transform(deps: any[], fn: (...args: any[]) => any[]) {
  return {
    action: TRANSFORM_DEPS,
    fn: fn,
    deps
  }
}

export function isProxy(target: Record<string, any>) {
  // @ts-expect-error - using symbol as index signature for object
  return !!target[IS_PROXY]
}

export function keyToString(key: BindKey) {
  // @ts-expect-error name does not exist on string or symbol
  return String(key.name || key)
}
