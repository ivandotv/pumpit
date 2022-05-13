import { PumpIt } from '../../pumpit'
import { get, getArray, isProxy, transform } from '../../utils'

describe('Transform dependencies', () => {
  describe('Class', () => {
    test('transform function receives resolved dependencies', () => {
      const pumpIt = new PumpIt()
      const classKey = Symbol()
      const keyA = Symbol()
      const keyB = Symbol()
      const keyC = Symbol()

      const valueA = { name: 'a' }
      const valueB = { name: 'b' }
      const valueC = { name: 'c' }

      const transformFn = jest.fn().mockReturnValue([valueA, valueB, valueC])

      class TestA {
        static inject = transform([keyA, keyB, keyC], transformFn)
      }

      pumpIt
        .bindClass(classKey, TestA)
        .bindValue(keyA, valueA)
        .bindValue(keyB, valueB)
        .bindValue(keyC, valueC)
        .resolve<TestA>(classKey)

      expect(transformFn).toHaveBeenCalledWith(
        pumpIt,
        valueA,
        valueB,
        valueC,
        undefined
      )
    })

    test('transform function receives resolved dependency as an array', () => {
      const pumpIt = new PumpIt()
      const classKey = Symbol()
      const keyA = Symbol()
      const keyB = Symbol()
      const keyC = Symbol()

      const valueA = {}
      const valueB = {}
      const valueC = {}

      const transformFn = jest.fn().mockReturnValue([valueA, valueB, valueC])

      class TestA {
        static inject = transform([getArray([keyA, keyB, keyC])], transformFn)
      }

      pumpIt
        .bindClass(classKey, TestA)
        .bindValue(keyA, valueA)
        .bindValue(keyB, valueB)
        .bindValue(keyC, valueC)
        .resolve<TestA>(classKey)

      expect(transformFn).toHaveBeenCalledWith(
        pumpIt,
        [valueA, valueB, valueC],
        undefined
      )
    })

    test('transform function receives proxy dependency', () => {
      const pumpIt = new PumpIt()
      const keyA = Symbol('keyA')
      const keyB = Symbol('keyB')

      class TestA {
        static inject = [get(keyB)]
      }

      class TestB {
        static inject = transform(
          [get(keyA, { lazy: true })],
          (_injector: PumpIt, keyA: TestA) => {
            expect(isProxy(keyA)).toBe(true)

            return [keyA]
          }
        )
      }

      pumpIt.bindClass(keyA, TestA).bindClass(keyB, TestB).resolve<TestA>(keyA)

      expect.assertions(1)
    })

    test('transform function can replace dependencies', () => {
      const pumpIt = new PumpIt()
      const classKey = Symbol()
      const keyA = Symbol()
      const keyB = Symbol()
      const keyC = Symbol()

      const valueA = {}
      const valueB = {}
      const valueC = {}

      const transformedA = {}
      const transformedB = {}
      const transformedC = {}

      const injectTransform = jest
        .fn()
        .mockReturnValue([transformedA, transformedB, transformedC])

      class TestA {
        static inject = transform([keyA, keyB, keyC], injectTransform)

        constructor(public keyA: any, public keyB: any, public keyC: any) {}
      }

      pumpIt
        .bindClass(classKey, TestA)
        .bindValue(keyA, valueA)
        .bindValue(keyB, valueB)
        .bindValue(keyC, valueC)

      const instance = pumpIt.resolve<TestA>(classKey)

      expect(injectTransform).toHaveBeenCalledWith(
        pumpIt,
        valueA,
        valueB,
        valueC,
        undefined
      )
      expect(instance.keyA).toBe(transformedA)
      expect(instance.keyB).toBe(transformedB)
      expect(instance.keyC).toBe(transformedC)
    })
  })

  describe('Factory', () => {
    test('transform function receives resolved dependencies', () => {
      const pumpIt = new PumpIt()
      const factoryKey = Symbol()
      const keyA = Symbol()
      const keyB = Symbol()
      const keyC = Symbol()
      const requestData = { foo: 'bar' }

      const valueA = {}
      const valueB = {}
      const valueC = {}

      const injectTransform = jest
        .fn()
        .mockReturnValue([valueA, valueB, valueC])

      // eslint-disable-next-line @typescript-eslint/no-empty-function
      const factory = () => {}
      factory.inject = transform([keyA, keyB, keyC], injectTransform)

      pumpIt
        .bindFactory(factoryKey, factory)
        .bindValue(keyA, valueA)
        .bindValue(keyB, valueB)
        .bindValue(keyC, valueC)
        .resolve<ReturnType<typeof factory>>(factoryKey, { data: requestData })

      expect(injectTransform).toHaveBeenCalledWith(
        pumpIt,
        valueA,
        valueB,
        valueC,
        {
          data: requestData
        }
      )
    })

    test('transform function can replace dependencies', () => {
      const pumpIt = new PumpIt()
      const factoryKey = Symbol()
      const keyA = Symbol()
      const keyB = Symbol()
      const keyC = Symbol()

      const valueA = {}
      const valueB = {}
      const valueC = {}

      const transformedA = {}
      const transformedB = {}
      const transformedC = {}

      const factory = jest.fn()
      // @ts-expect-error - there is no inject on jest.fn
      factory.inject = transform([keyA, keyB, keyC], () => [
        transformedA,
        transformedB,
        transformedC
      ])

      pumpIt
        .bindFactory(factoryKey, factory)
        .bindValue(keyA, valueA)
        .bindValue(keyB, valueB)
        .bindValue(keyC, valueC)
        .resolve<typeof factory>(factoryKey)

      expect(factory).toHaveBeenCalledWith(
        transformedA,
        transformedB,
        transformedC
      )
    })
  })
})
