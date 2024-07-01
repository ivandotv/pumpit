import { describe, expect, test, vi } from "vitest"
import { PumpIt } from "../pumpit"

describe("Unbind", () => {
  test("throw if the key is not found", () => {
    const pumpIt = new PumpIt()

    expect(() => pumpIt.unbind("does_not_exist")).toThrow("not found")
  })

  test("unbind factory", () => {
    const pumpIt = new PumpIt()
    const keyA = Symbol("key_a")

    const factoryReturnValue = "hello"
    const factory = () => () => factoryReturnValue
    factory.dispose = vi.fn()

    pumpIt.bindFactory(keyA, factory)
    pumpIt.unbind(keyA)

    expect(pumpIt.has(keyA)).toBe(false)
  })

  test('unbind factory and call the "dispose" method', () => {
    const pumpIt = new PumpIt()
    const keyA = Symbol("key_a")

    const disposeCall = vi.fn()
    const factory = () => {
      const functionToReturn = () => {}

      functionToReturn.dispose = disposeCall

      return functionToReturn
    }

    pumpIt.bindFactory(keyA, factory, { scope: "SINGLETON" })
    pumpIt.resolve(keyA)

    pumpIt.unbind(keyA)

    expect(pumpIt.has(keyA)).toBe(false)
    expect(() => pumpIt.resolve(keyA)).toThrow("not found")
    expect(disposeCall).toHaveBeenCalled()
  })

  test('unbind factory and do not call the "dispose" method', () => {
    const pumpIt = new PumpIt()
    const keyA = Symbol("key_a")

    const disposeCall = vi.fn()
    const factory = () => {
      const functionToReturn = () => {}

      functionToReturn.dispose = disposeCall

      return functionToReturn
    }

    pumpIt.bindFactory(keyA, factory, { scope: "SINGLETON" })
    pumpIt.resolve(keyA)

    pumpIt.unbind(keyA, false)

    expect(pumpIt.has(keyA)).toBe(false)
    expect(() => pumpIt.resolve(keyA)).toThrow("not found")
    expect(disposeCall).not.toHaveBeenCalled()
  })

  test("unbind class", () => {
    const pumpIt = new PumpIt()
    const keyA = Symbol("key_a")

    class TestA {}

    pumpIt.bindClass(keyA, TestA)
    pumpIt.unbind(keyA)

    expect(pumpIt.has(keyA)).toBe(false)
  })

  test('unbind class and call the "dispose" method', () => {
    const pumpIt = new PumpIt()
    const keyA = Symbol("key_a")

    const disposeCall = vi.fn()
    class TestA {
      dispose() {
        disposeCall()
      }
    }

    pumpIt.bindClass(keyA, TestA, { scope: "SINGLETON" })
    pumpIt.resolve(keyA)

    pumpIt.unbind(keyA)

    expect(pumpIt.has(keyA)).toBe(false)
    expect(() => pumpIt.resolve(keyA)).toThrow("not found")
    expect(disposeCall).toHaveBeenCalled()
  })

  test('unbind class and do not call the "dispose" method', () => {
    const pumpIt = new PumpIt()
    const keyA = Symbol("key_a")

    const disposeCall = vi.fn()
    class TestA {
      dispose() {
        disposeCall()
      }
    }

    pumpIt.bindClass(keyA, TestA, { scope: "SINGLETON" })
    pumpIt.resolve(keyA)

    pumpIt.unbind(keyA)

    expect(pumpIt.has(keyA)).toBe(false)
    expect(() => pumpIt.resolve(keyA)).toThrow("not found")
    expect(disposeCall).toHaveBeenCalled()
  })

  describe("Unbind all", () => {
    test("after removing all the keys, no keys can be retrieved", () => {
      const pumpIt = new PumpIt()
      const factoryKey = Symbol("a")
      const classKey = Symbol("b")
      const valueKey = Symbol("c")

      const classDisposeCall = vi.fn()
      class TestA {
        dispose() {
          classDisposeCall()
        }
      }

      const factoryDisposeCall = vi.fn()
      const factory = () => {
        const functionToReturn = () => {}

        functionToReturn.dispose = factoryDisposeCall

        return functionToReturn
      }

      const value = { name: "ivan" }

      pumpIt.bindFactory(factoryKey, factory, { scope: "SINGLETON" })
      pumpIt.bindClass(classKey, TestA)
      pumpIt.bindValue(valueKey, value)

      pumpIt.resolve(factoryKey)
      pumpIt.unbindAll()

      expect(pumpIt.has(factoryKey)).toBe(false)
      expect(pumpIt.has(classKey)).toBe(false)
      expect(pumpIt.has(valueKey)).toBe(false)
      expect(() => pumpIt.resolve(factoryKey)).toThrow("not found")
      expect(() => pumpIt.resolve(classKey)).toThrow("not found")
      expect(() => pumpIt.resolve(classKey)).toThrow("not found")
      expect(factoryDisposeCall).toHaveBeenCalledTimes(1)
      expect(classDisposeCall).not.toHaveBeenCalled()
    })

    test("do not call the dispose method", () => {
      const pumpIt = new PumpIt()
      const factoryKey = Symbol("a")
      const classKey = Symbol("b")
      const valueKey = Symbol("c")

      const classDisposeCall = vi.fn()
      class TestA {
        dispose() {
          classDisposeCall()
        }
      }

      const factoryDisposeCall = vi.fn()
      const factory = () => {
        const functionToReturn = () => {}

        functionToReturn.dispose = factoryDisposeCall

        return functionToReturn
      }

      const value = { name: "ivan" }

      pumpIt.bindFactory(factoryKey, factory, { scope: "SINGLETON" })
      pumpIt.bindClass(classKey, TestA, { scope: "SINGLETON" })
      pumpIt.bindValue(valueKey, value)

      pumpIt.resolve(factoryKey)
      pumpIt.unbindAll(false)

      expect(factoryDisposeCall).not.toHaveBeenCalled()
      expect(classDisposeCall).not.toHaveBeenCalled()
    })
  })

  test("unbind falsy values", () => {
    const pumpit = new PumpIt()

    const stringValue = ""
    const undefinedValue = undefined
    const nullValue = null
    const falseValue = false
    pumpit.bindValue("string", stringValue)
    pumpit.bindValue("undefined", undefinedValue)
    pumpit.bindValue("null", nullValue)
    pumpit.bindValue("false", falseValue)

    expect(pumpit.resolve("string")).toBe(stringValue)
    expect(pumpit.resolve("undefined")).toBe(undefinedValue)
    expect(pumpit.resolve("null")).toBe(nullValue)
    expect(pumpit.resolve("false")).toBe(falseValue)

    expect(() => {
      pumpit.unbindAll()
    }).not.toThrow()
  })
})
