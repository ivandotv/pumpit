import { describe, expect, test, vi } from 'vitest'
import { PumpIt } from '../../pumpit'
import { get, getArray, transform } from '../../utils'

describe('Transform dependencies', () => {
  describe('Class', () => {
    test('transform function receives resolved dependencies', () => {
      const pumpIt = new PumpIt()
      const classKey = Symbol()
      const keyA = Symbol()
      const keyB = Symbol()
      const keyC = Symbol()

      const resolveCtx = { hello: 'world' }

      const valueA = { name: 'a' }
      const valueB = { name: 'b' }
      const valueC = { name: 'c' }

      const transformFn = vi.fn().mockReturnValue([valueA, valueB, valueC])

      class TestA {
        static inject = transform([keyA, keyB, keyC], transformFn)
      }

      pumpIt
        .bindClass(classKey, TestA)
        .bindValue(keyA, valueA)
        .bindValue(keyB, valueB)
        .bindValue(keyC, valueC)
        .resolve<TestA>(classKey, resolveCtx)

      expect(transformFn).toHaveBeenCalledWith(
        {
          container: pumpIt,
          ctx: resolveCtx
        },
        valueA,
        valueB,
        valueC
      )
    })

    test('transform function can be applied on object registration', () => {
      const pumpIt = new PumpIt()
      const classKey = Symbol()
      const keyA = Symbol()
      const keyB = Symbol()
      const keyC = Symbol()

      const valueA = { name: 'a' }
      const valueB = { name: 'b' }
      const valueC = { name: 'c' }

      const transformFn = vi.fn().mockReturnValue([valueA, valueB, valueC])

      class TestA {
        constructor(
          public a: any,
          public b: any,
          public c: any
        ) {}
      }

      pumpIt
        .bindClass(classKey, {
          value: TestA,
          inject: transform([keyA, keyB, keyC], transformFn)
        })
        .bindValue(keyA, valueA)
        .bindValue(keyB, valueB)
        .bindValue(keyC, valueC)

      const instance = pumpIt.resolve<TestA>(classKey)

      expect(transformFn).toHaveBeenCalledWith(
        {
          container: pumpIt,
          ctx: undefined
        },
        valueA,
        valueB,
        valueC
      )

      expect(instance.a).toBe(valueA)
      expect(instance.b).toBe(valueB)
      expect(instance.c).toBe(valueC)
    })

    test('transform function receives resolved dependency as an array', () => {
      const pumpIt = new PumpIt()
      const classKey = Symbol()
      const keyA = Symbol()
      const keyB = Symbol()
      const keyC = Symbol()

      const valueA = { a: 'a' }
      const valueB = { b: 'b' }
      const valueC = { c: 'c' }

      const transformFn = vi.fn().mockReturnValue([valueA, valueB, valueC])

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
        { container: pumpIt, ctx: undefined },
        [valueA, valueB, valueC]
      )
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

      const injectTransform = vi
        .fn()
        .mockReturnValue([transformedA, transformedB, transformedC])

      class TestA {
        static inject = transform([keyA, keyB, keyC], injectTransform)

        constructor(
          public keyA: any,
          public keyB: any,
          public keyC: any
        ) {}
      }

      pumpIt
        .bindClass(classKey, TestA)
        .bindValue(keyA, valueA)
        .bindValue(keyB, valueB)
        .bindValue(keyC, valueC)

      const instance = pumpIt.resolve<TestA>(classKey)

      expect(injectTransform).toHaveBeenCalledWith(
        {
          container: pumpIt,
          ctx: undefined
        },
        valueA,
        valueB,
        valueC
      )
      expect(instance.keyA).toBe(transformedA)
      expect(instance.keyB).toBe(transformedB)
      expect(instance.keyC).toBe(transformedC)
    })

    test('transform function receives "undefined" for non existent dependency', () => {
      const pumpIt = new PumpIt()
      const keyA = Symbol()
      const keyC = Symbol()

      const valueA = {}
      const valueC = {}

      const injectTransform = vi.fn().mockReturnValue([])

      class TestA {
        static inject = transform(
          [keyA, get('not_found', { optional: true }), keyC],
          injectTransform
        )

        constructor(
          public keyA: any,
          public keyB: any,
          public keyC: any
        ) {}
      }

      pumpIt
        .bindClass(TestA, TestA)
        .bindValue(keyA, valueA)
        .bindValue(keyC, valueC)
        .resolve<TestA>(TestA)

      expect(injectTransform).toHaveBeenCalledWith(
        {
          container: pumpIt,
          ctx: undefined
        },
        valueA,
        undefined,
        valueC
      )
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

      const injectTransform = vi.fn().mockReturnValue([valueA, valueB, valueC])

      const factory = () => {}
      factory.inject = transform([keyA, keyB, keyC], injectTransform)

      pumpIt
        .bindFactory(factoryKey, factory)
        .bindValue(keyA, valueA)
        .bindValue(keyB, valueB)
        .bindValue(keyC, valueC)
        .resolve<ReturnType<typeof factory>>(factoryKey, { data: requestData })

      expect(injectTransform).toHaveBeenCalledWith(
        {
          container: pumpIt,
          ctx: {
            data: requestData
          }
        },
        valueA,
        valueB,
        valueC
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

      const factory = vi.fn()
      // @ts-expect-error - there is no inject on vi.fn
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
