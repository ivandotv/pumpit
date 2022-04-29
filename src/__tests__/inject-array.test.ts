import { Pumpa } from '../pumpa'
import { get, getArray } from '../utils'

describe('Inject array of values as a single dependency', () => {
  test('inject  values', () => {
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
      .bindValue(keyOne, valueOne)
      .bindValue(keyTwo, valueTwo)
      .bindClass('class_a', TestA)

    const instance = pumpa.resolve<TestA>('class_a')

    expect(instance.props).toEqual([valueOne, valueTwo])
  })

  test('if the key is not found, set it to undefined', () => {
    const pumpa = new Pumpa()
    const keyTwo = 'key_two'
    const valueTwo = 2

    class TestA {
      static inject = [getArray([get('not_found', { optional: true }), keyTwo])]

      constructor(public props?: [string, number?]) {}
    }

    pumpa.bindValue(keyTwo, valueTwo)
    pumpa.bindClass('class_a', TestA)

    const instance = pumpa.resolve<TestA>('class_a')

    expect(instance.props).toEqual([undefined, valueTwo])
  })

  test('if the key is not found, do not add "undefined" value', () => {
    const pumpa = new Pumpa()
    const classKey = 'key_class'
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

    pumpa.bindValue(keyTwo, valueTwo)
    pumpa.bindClass(classKey, TestA)

    const instance = pumpa.resolve<TestA>(classKey)

    expect(instance.props).toEqual([valueTwo])
  })

  test('throw if all the keys in the array are not optional', () => {
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

    pumpa.bindValue(keyTwo, valueTwo)
    pumpa.bindClass('class_a', TestA)

    expect(() => pumpa.resolve<TestA>('class_a')).toThrowError('not found')
  })

  test('set the whole array to undefined if there are no resolved keys', () => {
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

    pumpa.bindClass('class_a', TestA)

    const instance = pumpa.resolve<TestA>('class_a')

    expect(instance.props).toBeUndefined()
  })
})
