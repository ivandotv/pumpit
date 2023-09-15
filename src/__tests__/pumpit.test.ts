import { PumpIt } from '../pumpit'
import { get, getArray } from '../utils'

describe('Optional injection', () => {
  test('injection does not throw', () => {
    const pumpIt = new PumpIt()

    class TestA {
      static inject = [get('does_not_exist', { optional: true })]

      constructor(public optionalProp?: string) {}
    }

    pumpIt.bindClass(TestA, TestA)

    expect(() => pumpIt.resolve<TestA>(TestA)).not.toThrow()
  })

  test('injection resolves to undefined', () => {
    const pumpIt = new PumpIt()

    class TestA {
      static inject = [get('key_a', { optional: true })]

      constructor(public optionalProp?: string) {}
    }

    pumpIt.bindClass('class_a', TestA)
    const instance = pumpIt.resolve<TestA>('class_a')

    expect(instance.optionalProp).toBeUndefined()
  })

  test('injection can be at the last position', () => {
    const pumpIt = new PumpIt()

    const keyOne = 'key_one'
    const valueOne = 1
    const keyTwo = 'undefined_key'

    class TestA {
      static inject = [keyOne, get(keyTwo, { optional: true })]

      constructor(
        public keyOne: number,
        public optionalProp?: string,
        // @ts-expect-error for testing purposes
        public keyThree: number
      ) {}
    }

    pumpIt.bindValue(keyOne, valueOne)
    pumpIt.bindClass('class_a', TestA)

    const instance = pumpIt.resolve<TestA>('class_a')

    expect(instance.keyOne).toBe(valueOne)
    expect(instance.optionalProp).toBeUndefined()
  })

  test('injection can be at in any position', () => {
    const pumpIt = new PumpIt()

    const keyOne = 'key_one'
    const valueOne = 1
    const keyTwo = 'undefined_key'
    const keyThree = 'key_two'
    const valueThree = 2

    class TestA {
      static inject = [keyOne, get(keyTwo, { optional: true }), keyThree]

      constructor(
        public keyOne: number,
        public optionalProp?: string,
        // @ts-expect-error for testing purposes
        public keyThree: number
      ) {}
    }

    pumpIt.bindValue(keyOne, valueOne)
    pumpIt.bindValue(keyThree, valueThree)
    pumpIt.bindClass('class_a', TestA)

    const instance = pumpIt.resolve<TestA>('class_a')

    expect(instance.keyOne).toBe(valueOne)
    expect(instance.optionalProp).toBeUndefined()
    expect(instance.keyThree).toBe(valueThree)
  })

  test('class - empty injection does not throw', () => {
    const pumpIt = new PumpIt()
    const key = 'some_key'

    class TestA {
      static inject = []
    }

    pumpIt.bindClass(key, TestA)

    expect(() => pumpIt.resolve(key)).not.toThrow()
  })

  test('factory - empty injection does not throw', () => {
    const pumpIt = new PumpIt()
    const key = 'some_key'

    const factory = () => {}
    factory.inject = []

    pumpIt.bindFactory(key, factory)

    expect(() => pumpIt.resolve(key)).not.toThrow()
  })

  test('".bind" methods are chainable', () => {
    const pumpIt = new PumpIt()

    const ref = pumpIt
      .bindClass('a', class {})
      .bindFactory('b', () => () => {})
      .bindValue('c', true)

    expect(ref).toBe(pumpIt)
  })

  test('values can be retrieved via symbols', () => {
    const pumpIt = new PumpIt()
    const keyA = Symbol('key_a')
    const keyB = Symbol('key_b')
    const keyC = Symbol()

    class TestA {}
    const value = { hello: 'world' }

    const factoryReturnValue = 'hello'
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

  test('values can be bound via any object', () => {
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

  test('injection values can be any object', () => {
    const pumpIt = new PumpIt()

    class TestA {}
    class TestB {}
    class TestC {}

    const classKeyA = TestA
    const objectKeyB = {}
    const functionKeyC = () => {}
    const keyD = Symbol()

    class TestD {
      constructor(
        public a: TestA,
        public bc: [TestB, TestC]
      ) {}

      static inject = [
        get(classKeyA),
        getArray([get(objectKeyB), functionKeyC])
      ]
    }

    pumpIt.bindClass(classKeyA, TestA)
    pumpIt.bindClass(objectKeyB, TestB)
    pumpIt.bindClass(functionKeyC, TestC)
    pumpIt.bindClass(keyD, TestD)

    const instance = pumpIt.resolve<TestD>(keyD)

    expect(instance.a).toBeInstanceOf(TestA)
    expect(instance.bc[0]).toBeInstanceOf(TestB)
    expect(instance.bc[1]).toBeInstanceOf(TestC)
  })

  test('injection with object - key - value', () => {
    const pumpIt = new PumpIt()
    const classKeyA = 'a'
    const objectKeyB = {}
    const functionKeyC = () => {}
    const keyD = Symbol()

    class TestA {}
    class TestB {}
    class TestD {}

    const factory = (a: TestA, bd: [TestB, TestD]) => {
      return {
        a,
        bd
      }
    }

    pumpIt
      .bindClass(classKeyA, { value: TestA, inject: [] })
      .bindClass(objectKeyB, TestB)
      .bindFactory(functionKeyC, {
        value: factory,
        inject: [
          get(classKeyA, { lazy: true }),
          getArray([get(objectKeyB, { lazy: true }), get(keyD, { lazy: true })])
        ]
      })
      .bindClass(keyD, TestD)

    const instance = pumpIt.resolve<ReturnType<typeof factory>>(functionKeyC)

    expect(instance.a).toBeInstanceOf(TestA)
    expect(instance.bd[0]).toBeInstanceOf(TestB)
    expect(instance.bd[1]).toBeInstanceOf(TestD)
  })
})
