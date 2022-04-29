/* eslint-disable @typescript-eslint/no-empty-function */
import { Pumpa } from '../pumpa'
import { get } from '../utils'

describe('Optional injection', () => {
  test('injection does not throw', () => {
    const pumpa = new Pumpa()

    class TestA {
      static inject = [get('key_a', { optional: true })]

      constructor(public optionalProp?: string) {}
    }

    pumpa.bindClass('class_a', TestA)

    expect(() => pumpa.resolve<TestA>('class_a')).not.toThrow()
  })

  test('injection resolves to undefined', () => {
    const pumpa = new Pumpa()

    class TestA {
      static inject = [get('key_a', { optional: true })]

      constructor(public optionalProp?: string) {}
    }

    pumpa.bindClass('class_a', TestA)
    const instance = pumpa.resolve<TestA>('class_a')

    expect(instance.optionalProp).toBeUndefined()
  })

  test('injection can be at the last position', () => {
    const pumpa = new Pumpa()

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

    pumpa.bindValue(keyOne, valueOne)
    pumpa.bindClass('class_a', TestA)

    const instance = pumpa.resolve<TestA>('class_a')

    expect(instance.keyOne).toBe(valueOne)
    expect(instance.optionalProp).toBeUndefined()
  })

  test('injection can be at in any position', () => {
    const pumpa = new Pumpa()

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

    pumpa.bindValue(keyOne, valueOne)
    pumpa.bindValue(keyThree, valueThree)
    pumpa.bindClass('class_a', TestA)

    const instance = pumpa.resolve<TestA>('class_a')

    expect(instance.keyOne).toBe(valueOne)
    expect(instance.optionalProp).toBeUndefined()
    expect(instance.keyThree).toBe(valueThree)
  })

  test('class - empty injection does not throw', () => {
    const pumpa = new Pumpa()
    const key = 'some_key'

    class TestA {
      static inject = []
    }

    pumpa.bindClass(key, TestA)

    expect(() => pumpa.resolve(key)).not.toThrow()
  })

  test('factory - empty injection does not throw', () => {
    const pumpa = new Pumpa()
    const key = 'some_key'

    const factory = () => {}
    factory.inject = []

    pumpa.bindFactory(key, factory)

    expect(() => pumpa.resolve(key)).not.toThrow()
  })

  test('".bind" methods are chainable', () => {
    const pumpa = new Pumpa()

    const ref = pumpa
      .bindClass('a', class {})
      .bindFactory('b', () => () => {})
      .bindValue('c', true)

    expect(ref).toBe(pumpa)
  })

  test('values can be retrieved via symbols', () => {
    const pumpa = new Pumpa()
    const keyA = Symbol('key_a')
    const keyB = Symbol('key_b')
    const keyC = Symbol()

    class TestA {}
    const value = { hello: 'world' }

    const factoryReturnValue = 'hello'
    const factory = () => () => factoryReturnValue

    pumpa.bindClass(keyA, TestA)
    pumpa.bindValue(keyB, value)
    pumpa.bindFactory(keyC, factory)

    const resolvedClass = pumpa.resolve<TestA>(keyA)
    const resolvedValue = pumpa.resolve<typeof value>(keyB)
    const resolvedFactory = pumpa.resolve<ReturnType<typeof factory>>(keyC)

    expect(resolvedClass).toBeInstanceOf(TestA)
    expect(resolvedFactory()).toBe(factoryReturnValue)
    expect(resolvedValue).toBe(value)
  })
})
