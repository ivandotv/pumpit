import { Pumpa } from '../pumpa'
import { get } from '../utils'

describe('Optional injection', () => {
  test('Optional does not throw', () => {
    const pumpa = new Pumpa()

    class TestA {
      static inject = [get('some_key', { optional: true })]

      constructor(public optionalProp?: string) {}
    }

    pumpa.addClass('class_a', TestA)

    expect(() => pumpa.resolve<TestA>('class_a')).not.toThrow()
  })
  test('Optional injection resolves to undefined', () => {
    const pumpa = new Pumpa()

    class TestA {
      static inject = [get('some_key', { optional: true })]

      constructor(public optionalProp?: string) {}
    }

    pumpa.addClass('class_a', TestA)
    const instance = pumpa.resolve<TestA>('class_a')

    expect(instance.optionalProp).toBeUndefined()
  })

  test('Optional injection at last position', () => {
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

  test('Optional injection can at in any position', () => {
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

  test('"Add" methods are chainable', () => {
    const pumpa = new Pumpa()

    const ref = pumpa
      .addClass('a', class {})
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      .addFactory('b', () => () => {})
      .addValue('c', true)

    expect(ref).toBe(pumpa)
  })
})
