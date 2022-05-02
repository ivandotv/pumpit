import { BindKey } from './types'

export const PROXY_TARGET = Symbol()
export const IS_PROXY = Symbol()

/* istanbul ignore next: not all proxy methods can be easily covered */
export function createProxy(proxyTarget: any, isClass: boolean, key: BindKey) {
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
      if (prop === IS_PROXY) {
        return true
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
