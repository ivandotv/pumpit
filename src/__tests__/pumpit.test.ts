import { describe, expect, test } from "vitest"
import { PumpIt } from "../pumpit"
import { get } from "../utils"

describe("Optional injection", () => {
  test("injection does not throw", () => {
    const pumpIt = new PumpIt()

    class TestA {
      static inject = [get("does_not_exist", { optional: true })]

      constructor(public optionalProp?: string) {}
    }

    pumpIt.bindClass(TestA, TestA)

    expect(() => pumpIt.resolve<TestA>(TestA)).not.toThrow()
  })

  test("injection resolves to undefined", () => {
    const pumpIt = new PumpIt()

    class TestA {
      static inject = [get("key_a", { optional: true })]

      constructor(public optionalProp?: string) {}
    }

    pumpIt.bindClass("class_a", TestA)
    const instance = pumpIt.resolve<TestA>("class_a")

    expect(instance.optionalProp).toBeUndefined()
  })

  test("injection can be at the last position", () => {
    const pumpIt = new PumpIt()

    const keyOne = "key_one"
    const valueOne = 1
    const keyTwo = "undefined_key"

    class TestA {
      static inject = [keyOne, get(keyTwo, { optional: true })]

      constructor(
        public keyOne: number,
        // biome-ignore lint/style/useDefaultParameterLast: tests
        public optionalProp?: string,
        // @ts-expect-error for testing purposes
        public keyThree: number,
      ) {}
    }

    pumpIt.bindValue(keyOne, valueOne)
    pumpIt.bindClass("class_a", TestA)

    const instance = pumpIt.resolve<TestA>("class_a")

    expect(instance.keyOne).toBe(valueOne)
    expect(instance.optionalProp).toBeUndefined()
  })

  test("throw when circular reference is detected", () => {
    const pumpIt = new PumpIt()
    const keyA = "key_a"
    const keyB = Symbol("key_b")
    const keyC = "key_c"

    class TestA {
      static inject = [keyB]
    }
    class TestB {
      static inject = [keyC]
    }
    class TestC {
      static inject = [keyA]
    }

    pumpIt.bindClass(keyA, TestA).bindClass(keyB, TestB).bindClass(keyC, TestC)

    expect(() => pumpIt.resolve<TestA>(keyA)).toThrow(
      "Circular reference detected",
    )
  })

  test("injection can be at in any position", () => {
    const pumpIt = new PumpIt()

    const keyOne = "key_one"
    const valueOne = 1
    const keyTwo = "undefined_key"
    const keyThree = "key_two"
    const valueThree = 2

    class TestA {
      static inject = [keyOne, get(keyTwo, { optional: true }), keyThree]

      constructor(
        public keyOne: number,
        // biome-ignore lint/style/useDefaultParameterLast: <explanation>
        public optionalProp?: string,
        // @ts-expect-error for testing purposes
        public keyThree: number,
      ) {}
    }

    pumpIt.bindValue(keyOne, valueOne)
    pumpIt.bindValue(keyThree, valueThree)
    pumpIt.bindClass("class_a", TestA)

    const instance = pumpIt.resolve<TestA>("class_a")

    expect(instance.keyOne).toBe(valueOne)
    expect(instance.optionalProp).toBeUndefined()
    expect(instance.keyThree).toBe(valueThree)
  })

  test("class - empty injection does not throw", () => {
    const pumpIt = new PumpIt()
    const key = "some_key"

    class TestA {
      static inject = []
    }

    pumpIt.bindClass(key, TestA)

    expect(() => pumpIt.resolve(key)).not.toThrow()
  })

  test("factory - empty injection does not throw", () => {
    const pumpIt = new PumpIt()
    const key = "some_key"

    const factory = () => {}
    factory.inject = []

    pumpIt.bindFactory(key, factory)

    expect(() => pumpIt.resolve(key)).not.toThrow()
  })

  test('".bind" methods are chainable', () => {
    const pumpIt = new PumpIt()

    const ref = pumpIt
      .bindClass("a", class {})
      .bindFactory("b", () => () => {})
      .bindValue("c", true)

    expect(ref).toBe(pumpIt)
  })

  test("values can be retrieved via symbols", () => {
    const pumpIt = new PumpIt()
    const keyA = Symbol("key_a")
    const keyB = Symbol("key_b")
    const keyC = Symbol()

    class TestA {}
    const value = { hello: "world" }

    const factoryReturnValue = "hello"
    const factory = () => () => factoryReturnValue

    pumpIt.bindClass(keyA, TestA)
    pumpIt.bindValue(keyB, value)
    pumpIt.bindFactory(keyC, factory)

    const resolvedClass = pumpIt.resolve<TestA>(keyA)
    const resolvedValue = pumpIt.resolve<typeof value>(keyB)
    const resolvedFactory = pumpIt.resolve<ReturnType<typeof factory>>(keyC)

    expect(resolvedClass).toBeInstanceOf(TestA)
    expect(resolvedFactory()).toBe(factoryReturnValue)
    expect(resolvedValue).toBe(value)
  })

  test("values can be bound via any object", () => {
    const pumpIt = new PumpIt()
    class TestA {}

    const objectKey = {}
    const classKey = TestA
    const functionKey = () => {}

    pumpIt.bindClass(objectKey, TestA)
    pumpIt.bindClass(classKey, TestA)
    pumpIt.bindClass(functionKey, TestA)

    const objectKeyInstance = pumpIt.resolve(objectKey)
    const classKeyInstance = pumpIt.resolve(classKey)
    const functionKeyInstance = pumpIt.resolve(functionKey)

    expect(objectKeyInstance).toBeInstanceOf(TestA)
    expect(classKeyInstance).toBeInstanceOf(TestA)
    expect(functionKeyInstance).toBeInstanceOf(TestA)
  })

  test("injection values can be any object", () => {
    const pumpIt = new PumpIt()

    class TestA {}
    class TestB {}

    const classKeyA = TestA
    const objectKeyB = {}
    const keyD = Symbol()

    class TestD {
      constructor(
        public a: TestA,
        public bc: TestB,
      ) {}

      static inject = [get(classKeyA), objectKeyB]
    }

    pumpIt.bindClass(classKeyA, TestA)
    pumpIt.bindClass(objectKeyB, TestB)
    pumpIt.bindClass(keyD, TestD)

    const instance = pumpIt.resolve<TestD>(keyD)

    expect(instance.a).toBeInstanceOf(TestA)
    expect(instance.bc).toBeInstanceOf(TestB)
  })

  test("injection with object - key - value", () => {
    const pumpIt = new PumpIt()
    const classKeyA = "a"
    const objectKeyB = {}
    const functionKeyC = () => {}

    class TestA {}
    class TestB {}

    const factory = (a: TestA, bd: TestB) => {
      return {
        a,
        bd,
      }
    }

    pumpIt
      .bindClass(classKeyA, { value: TestA, inject: [] })
      .bindClass(objectKeyB, TestB)
      .bindFactory(functionKeyC, {
        value: factory,
        inject: [get(classKeyA), objectKeyB],
      })

    const instance = pumpIt.resolve<ReturnType<typeof factory>>(functionKeyC)

    expect(instance.a).toBeInstanceOf(TestA)
    expect(instance.bd).toBeInstanceOf(TestB)
  })

  describe("instance name", () => {
    test("instance name can be passed via constructor", () => {
      const name = "instance_name"
      const pumpIt = new PumpIt(name)

      expect(pumpIt.getName()).toBe(name)
    })

    test("if instance name is not provided it will be undefined", () => {
      const pumpIt = new PumpIt()

      expect(pumpIt.getName()).toBe(undefined)
    })

    test("instance created via child can also have a name", () => {
      const name = "instance_name"
      const pumpIt = new PumpIt()
      const child = pumpIt.child(name)
      expect(child.getName()).toBe(name)
    })
  })
})
