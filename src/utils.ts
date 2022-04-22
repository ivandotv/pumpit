export type ParsedInjectionData =
  | { key: string; options: { optional?: boolean } } //get
  | {
      key: { key: string; options: { optional?: boolean } }[] //getArray
      options: {
        optional?: boolean
        removeUndefined?: boolean
        setToUndefinedIfEmpty?: boolean
      }
    }

export type InjectionData =
  | string
  | ReturnType<typeof get>
  | ReturnType<typeof getArray>

export function get(
  key: string,
  options?: {
    optional?: boolean
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
  data: (string | ReturnType<typeof get>)[],
  options?: {
    removeUndefined?: boolean
    setToUndefinedIfEmpty?: boolean
  }
) {
  return function a() {
    const result = []
    for (const d of data) {
      result.push(parseInjectionData(d))
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

export function parseInjectionData(key: InjectionData): ParsedInjectionData {
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
