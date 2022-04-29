export const TRANSFORM_DEPS = Symbol()

export type ParsedInjectionData =
  | { key: string | symbol; options: { optional?: boolean; lazy?: boolean } } //get
  | {
      key: { key: string | symbol; options: { optional?: boolean } }[] //getArray
      options: {
        optional?: boolean
        removeUndefined?: boolean
        setToUndefinedIfEmpty?: boolean
      }
    }

export type Injection =
  | string
  | symbol
  | ReturnType<typeof get>
  | ReturnType<typeof getArray>

export type InjectionData =
  | Injection[]
  | { action: symbol; fn: (...args: any) => any; deps: Injection[] }

export function get(
  key: string | symbol,
  options?: {
    optional?: boolean
    lazy?: boolean
  }
) {
  return () => {
    return {
      key,
      options: { ...options }
    }
  }
}

export function getArray(
  deps: (string | symbol | ReturnType<typeof get>)[],
  options?: {
    removeUndefined?: boolean
    setToUndefinedIfEmpty?: boolean
  }
) {
  return () => {
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
}

export function parseInjectionData(key: Injection): ParsedInjectionData {
  if (typeof key === 'function') {
    const ex = key()

    return {
      // @ts-expect-error type missmatch
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
