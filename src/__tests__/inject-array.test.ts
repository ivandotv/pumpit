import { Pumpa } from '../pumpa'
import { get, getArray } from '../utils'

describe('Inject array of values as a single property', () => {
  test('Inject  values', () => {
    const pumpa = new Pumpa()

    const keyOne = 'key_one'
    const valueOne = 'hello'
    const keyTwo = 'key_two'
    const valueTwo = 2

    class TestA {
      static inject = [getArray([get(keyOne), keyTwo])]

      constructor(public props?: [string?, number?]) {}
    }

    pumpa.addValue(keyOne, valueOne)
    pumpa.addValue(keyTwo, valueTwo)
    pumpa.addClass('class_a', TestA)

    const instance = pumpa.resolve<TestA>('class_a')

    expect(instance.props).toEqual([valueOne, valueTwo])
  })

  test('If value is not found, set it to undefined', () => {
    const pumpa = new Pumpa()

    const keyTwo = 'key_two'
    const valueTwo = 2

    class TestA {
      static inject = [getArray([get('not_found', { optional: true }), keyTwo])]

      constructor(public props?: [string, number?]) {}
    }

    pumpa.addValue(keyTwo, valueTwo)
    pumpa.addClass('class_a', TestA)

    const instance = pumpa.resolve<TestA>('class_a')

    expect(instance.props).toEqual([undefined, valueTwo])
  })

  test('If the value is not found, do not add undefined', () => {
    const pumpa = new Pumpa()

    const keyTwo = 'key_two'
    const valueTwo = 2

    class TestA {
      static inject = [
        getArray([get('not_found', { optional: true }), keyTwo], {
          removeUndefined: true
        })
      ]

      constructor(public props?: [string, number?]) {}
    }

    pumpa.addValue(keyTwo, valueTwo)
    pumpa.addClass('class_a', TestA)

    const instance = pumpa.resolve<TestA>('class_a')

    expect(instance.props).toEqual([valueTwo])
  })

  test('Throw if any value in array is not optional', () => {
    const pumpa = new Pumpa()

    const keyTwo = 'key_two'
    const valueTwo = 2

    class TestA {
      static inject = [
        getArray([get('not_found'), keyTwo], {
          removeUndefined: true
        })
      ]

      constructor(public props?: [string, number?]) {}
    }

    pumpa.addValue(keyTwo, valueTwo)
    pumpa.addClass('class_a', TestA)

    expect(() => pumpa.resolve<TestA>('class_a')).toThrowError('not found')
  })

  test('Set the whole array to undefined if no keys are resolved', () => {
    const pumpa = new Pumpa()

    class TestA {
      static inject = [
        getArray(
          [
            get('not_found', { optional: true }),
            get('not_found_2', { optional: true })
          ],
          {
            removeUndefined: true,
            setToUndefinedIfEmpty: true
          }
        )
      ]

      constructor(public props?: [string, number?]) {}
    }

    pumpa.addClass('class_a', TestA)

    const instance = pumpa.resolve<TestA>('class_a')

    expect(instance.props).toBeUndefined()
  })
})
