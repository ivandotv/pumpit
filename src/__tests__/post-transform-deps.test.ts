import { Pumpa } from '../pumpa'
import { transform } from '../utils'

describe('post transform dependencies', () => {
  describe('Class', () => {
    test('transform function receives resolved dependencies', () => {
      const pumpa = new Pumpa()
      const classKey = Symbol()
      const keyA = Symbol()
      const keyB = Symbol()
      const keyC = Symbol()

      const valueA = {}
      const valueB = {}
      const valueC = {}

      const transformFn = jest.fn().mockReturnValue([valueA, valueB, valueC])

      class TestA {
        static inject = transform([keyA, keyB, keyC], transformFn)
      }

      pumpa
        .addClass(classKey, TestA)
        .addValue(keyA, valueA)
        .addValue(keyB, valueB)
        .addValue(keyC, valueC)
        .resolve<TestA>(classKey)

      expect(transformFn).toHaveBeenCalledWith(pumpa, valueA, valueB, valueC)
    })

    test('Transform function can replace dependencies', () => {
      const pumpa = new Pumpa()
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

      pumpa
        .addClass(classKey, TestA)
        .addValue(keyA, valueA)
        .addValue(keyB, valueB)
        .addValue(keyC, valueC)

      const instance = pumpa.resolve<TestA>(classKey)

      expect(injectTransform).toHaveBeenCalledWith(
        pumpa,
        valueA,
        valueB,
        valueC
      )
      expect(instance.keyA).toBe(transformedA)
      expect(instance.keyB).toBe(transformedB)
      expect(instance.keyC).toBe(transformedC)
    })
  })

  describe('Factory', () => {
    test('transform function receives resolved dependencies', () => {
      const pumpa = new Pumpa()
      const factoryKey = Symbol()
      const keyA = Symbol()
      const keyB = Symbol()
      const keyC = Symbol()

      const valueA = {}
      const valueB = {}
      const valueC = {}

      const injectTransform = jest
        .fn()
        .mockReturnValue([valueA, valueB, valueC])

      // eslint-disable-next-line @typescript-eslint/no-empty-function
      const factory = () => {}
      factory.inject = transform([keyA, keyB, keyC], injectTransform)

      pumpa
        .addFactory(factoryKey, factory)
        .addValue(keyA, valueA)
        .addValue(keyB, valueB)
        .addValue(keyC, valueC)
        .resolve<ReturnType<typeof factory>>(factoryKey)

      expect(injectTransform).toHaveBeenCalledWith(
        pumpa,
        valueA,
        valueB,
        valueC
      )
    })

    test('transform function can replace dependencies', () => {
      const pumpa = new Pumpa()
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

      pumpa
        .addFactory(factoryKey, factory)
        .addValue(keyA, valueA)
        .addValue(keyB, valueB)
        .addValue(keyC, valueC)
        .resolve<typeof factory>(factoryKey)

      expect(factory).toHaveBeenCalledWith(
        transformedA,
        transformedB,
        transformedC
      )
    })
  })
})
