import { Pumpa } from '../pumpa'
import { get, getArray } from '../utils'

describe('Inject array of values for a single property', () => {
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

    pumpa
      .addValue(keyOne, valueOne)
      .addValue(keyTwo, valueTwo)
      .addClass('class_a', TestA)

    const instance = pumpa.resolve<TestA>('class_a')

    expect(instance.props).toEqual([valueOne, valueTwo])
  })

  test('If the key is not found, set it to undefined', () => {
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

  test('If the key is not found, do not add "undefined" value', () => {
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

  test('Throw if all keys in the array are not optional', () => {
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

  test('Set the whole array to undefined if there are no resolved keys', () => {
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
