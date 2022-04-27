/* eslint-disable @typescript-eslint/no-empty-function */
import { Pumpa } from '../pumpa'
import { get } from '../utils'

describe('Optional injection', () => {
  test('Optional does not throw', () => {
    const pumpa = new Pumpa()

    class TestA {
      static inject = [get('key_a', { optional: true })]

      constructor(public optionalProp?: string) {}
    }

    pumpa.addClass('class_a', TestA)

    expect(() => pumpa.resolve<TestA>('class_a')).not.toThrow()
  })

  test('Optional injection resolves to undefined', () => {
    const pumpa = new Pumpa()

    class TestA {
      static inject = [get('key_a', { optional: true })]

      constructor(public optionalProp?: string) {}
    }

    pumpa.addClass('class_a', TestA)
    const instance = pumpa.resolve<TestA>('class_a')

    expect(instance.optionalProp).toBeUndefined()
  })

  test('Optional injection can be at the last position', () => {
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

    pumpa.addValue(keyOne, valueOne)
    pumpa.addClass('class_a', TestA)

    const instance = pumpa.resolve<TestA>('class_a')

    expect(instance.keyOne).toBe(valueOne)
    expect(instance.optionalProp).toBeUndefined()
  })

  test('Optional injection can be at in any position', () => {
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

    pumpa.addValue(keyOne, valueOne)
    pumpa.addValue(keyThree, valueThree)
    pumpa.addClass('class_a', TestA)

    const instance = pumpa.resolve<TestA>('class_a')

    expect(instance.keyOne).toBe(valueOne)
    expect(instance.optionalProp).toBeUndefined()
    expect(instance.keyThree).toBe(valueThree)
  })

  test('Class - empty injection does not throw', () => {
    const pumpa = new Pumpa()
    const key = 'some_key'

    class TestA {
      static inject = []
    }

    pumpa.addClass(key, TestA)

    expect(() => pumpa.resolve(key)).not.toThrow()
  })

  test('Factory - empty injection does not throw', () => {
    const pumpa = new Pumpa()
    const key = 'some_key'

    const factory = () => {}
    factory.inject = []

    pumpa.addFactory(key, factory)

    expect(() => pumpa.resolve(key)).not.toThrow()
  })

  test('"Add" methods are chainable', () => {
    const pumpa = new Pumpa()

    const ref = pumpa
      .addClass('a', class {})

      .addFactory('b', () => () => {})
      .addValue('c', true)

    expect(ref).toBe(pumpa)
  })

  test('Can retrieve values via symbols', () => {
    const pumpa = new Pumpa()
    const keyA = Symbol('key_a')
    const keyB = Symbol('key_b')
    const keyC = Symbol()

    class TestA {}
    const value = { hello: 'world' }

    const factoryReturnValue = 'hello'
    const factory = () => () => factoryReturnValue

    pumpa.addClass(keyA, TestA)
    pumpa.addValue(keyB, value)
    pumpa.addFactory(keyC, factory)

    const resolvedClass = pumpa.resolve<TestA>(keyA)
    const resolvedValue = pumpa.resolve<typeof value>(keyB)
    const resolvedFactory = pumpa.resolve<ReturnType<typeof factory>>(keyC)

    expect(resolvedClass).toBeInstanceOf(TestA)
    expect(resolvedFactory()).toBe(factoryReturnValue)
    expect(resolvedValue).toBe(value)
  })

  describe('Remove', () => {
    test('Throw if the key is not found', () => {
      const pumpa = new Pumpa()

      expect(() => pumpa.remove('does_not_exist')).toThrowError('not found')
    })

    test('Remove factory', () => {
      const pumpa = new Pumpa()
      const keyA = Symbol('key_a')

      const factoryReturnValue = 'hello'
      const factory = () => () => factoryReturnValue
      factory.dispose = jest.fn()

      pumpa.addFactory(keyA, factory)
      pumpa.remove(keyA)

      expect(pumpa.has(keyA)).toBe(false)
    })

    test('Remove factory and call the "dispose" method', () => {
      const pumpa = new Pumpa()
      const keyA = Symbol('key_a')

      const disposeCall = jest.fn()
      const factory = () => {
        const functionToReturn = () => {}

        functionToReturn.dispose = disposeCall

        return functionToReturn
      }

      pumpa.addFactory(keyA, factory, { scope: 'SINGLETON' })
      pumpa.resolve(keyA)

      pumpa.remove(keyA)

      expect(pumpa.has(keyA)).toBe(false)
      expect(() => pumpa.resolve(keyA)).toThrowError('not found')
      expect(disposeCall).toHaveBeenCalled()
    })

    test('Remove factory and do not call the "dispose" method', () => {
      const pumpa = new Pumpa()
      const keyA = Symbol('key_a')

      const disposeCall = jest.fn()
      const factory = () => {
        const functionToReturn = () => {}

        functionToReturn.dispose = disposeCall

        return functionToReturn
      }

      pumpa.addFactory(keyA, factory, { scope: 'SINGLETON' })
      pumpa.resolve(keyA)

      pumpa.remove(keyA, false)

      expect(pumpa.has(keyA)).toBe(false)
      expect(() => pumpa.resolve(keyA)).toThrowError('not found')
      expect(disposeCall).not.toHaveBeenCalled()
    })

    test('Remove class', () => {
      const pumpa = new Pumpa()
      const keyA = Symbol('key_a')

      const disposeCall = jest.fn()
      class TestA {
        dispose() {
          disposeCall()
        }
      }

      pumpa.addClass(keyA, TestA)
      pumpa.remove(keyA)

      expect(pumpa.has(keyA)).toBe(false)
    })

    test('Remove class and call the "dispose" method', () => {
      const pumpa = new Pumpa()
      const keyA = Symbol('key_a')

      const disposeCall = jest.fn()
      class TestA {
        dispose() {
          disposeCall()
        }
      }

      pumpa.addClass(keyA, TestA, { scope: 'SINGLETON' })
      pumpa.resolve(keyA)

      pumpa.remove(keyA)

      expect(pumpa.has(keyA)).toBe(false)
      expect(() => pumpa.resolve(keyA)).toThrowError('not found')
      expect(disposeCall).toHaveBeenCalled()
    })

    test('Remove class and do not call the "dispose" method', () => {
      const pumpa = new Pumpa()
      const keyA = Symbol('key_a')

      const disposeCall = jest.fn()
      class TestA {
        dispose() {
          disposeCall()
        }
      }

      pumpa.addClass(keyA, TestA, { scope: 'SINGLETON' })
      pumpa.resolve(keyA)

      pumpa.remove(keyA)

      expect(pumpa.has(keyA)).toBe(false)
      expect(() => pumpa.resolve(keyA)).toThrowError('not found')
      expect(disposeCall).toHaveBeenCalled()
    })
  })
})
