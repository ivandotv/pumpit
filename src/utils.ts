export const PROXY_TARGET = Symbol('proxy_target_identity')

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

export type InjectionData =
  | string
  | symbol
  | ReturnType<typeof get>
  | ReturnType<typeof getArray>

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
  data: (string | symbol | ReturnType<typeof get>)[],
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

export function createProxy(
  proxyTarget: any,
  isClass: boolean,
  key: string | symbol
) {
  function checkCurrent() {
    if (!proxyTarget.current) {
      throw new Error(`Lazy target for key:${String(key)} not yet set`)
    }

    return proxyTarget.current
  }

  return new Proxy(proxyTarget, {
    apply: function (_, args) {
      const t = checkCurrent()

      return Reflect.apply(t, isClass ? t : undefined, args)
    },

    construct: function (_, args) {
      //allow completely new instance if someone calls the constructor
      return Reflect.construct(checkCurrent(), args)
    },
    get: function (target, prop, receiver) {
      if (prop === PROXY_TARGET) {
        return target.current
      }

      return Reflect.get(checkCurrent(), prop, receiver)
    },
    set: function (target, prop, value) {
      if (prop === 'current') {
        return Reflect.set(target, prop, value)
      }

      return Reflect.set(checkCurrent(), prop, value)
    },
    defineProperty: function (_, key, descriptor) {
      return Reflect.defineProperty(checkCurrent(), key, descriptor)
    },
    deleteProperty: function (_, prop) {
      return Reflect.deleteProperty(checkCurrent(), prop)
    },
    getPrototypeOf: function (_) {
      return Reflect.getPrototypeOf(checkCurrent())
    },
    setPrototypeOf: function (_, proto) {
      return Reflect.setPrototypeOf(checkCurrent(), proto)
    },
    getOwnPropertyDescriptor: function (_, prop) {
      return Reflect.getOwnPropertyDescriptor(checkCurrent(), prop)
    },
    has: function (_, prop) {
      return Reflect.has(checkCurrent(), prop)
    },
    isExtensible: function (_) {
      return Reflect.isExtensible(checkCurrent())
    },
    ownKeys: function (_) {
      return Reflect.ownKeys(checkCurrent())
    },
    preventExtensions: function (_) {
      return Reflect.preventExtensions(checkCurrent())
    }
  })
}
