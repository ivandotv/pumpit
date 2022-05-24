/* eslint-disable @typescript-eslint/no-empty-function */
import { PumpIt, SCOPE } from '../../pumpit'

describe('Resolve transform factory', () => {
  describe('Before resolve', () => {
    test('receives correct parameters', () => {
      const pumpIt = new PumpIt()
      const keyA = 'key_a'
      const keyB = Symbol()
      const valueB = { name: 'Ivan' }
      const callbackResolveData = { foo: 'bar' }

      const factoryValue = (keyB: typeof valueB) => keyB

      factoryValue.inject = [keyB]

      pumpIt.bindValue(keyB, valueB)
      pumpIt.bindFactory(keyA, factoryValue, {
        beforeResolve: (
          { container: injector, value: factory, ctx },
          ...deps
        ) => {
          expect(injector).toBe(pumpIt)
          expect(factory).toBe(factory)
          expect(deps).toEqual([valueB])
          expect(ctx.data).toBe(callbackResolveData)

          return factory(...deps)
        }
      })

      const resolved = pumpIt.resolve<typeof factoryValue>(keyA, {
        data: callbackResolveData
      })

      expect.assertions(5)
      expect(resolved).toBe(valueB)
    })

    test('returns custom value', () => {
      const pumpIt = new PumpIt()
      const keyA = 'key_a'
      const substituteValue = { name: 'Marco' }

      const factoryValue = () => {}

      pumpIt.bindFactory(keyA, factoryValue, {
        beforeResolve: () => {
          return substituteValue
        }
      })

      const instance = pumpIt.resolve(keyA)

      expect(instance).toBe(substituteValue)
    })

    test('runs once when the scope is "singleton"', () => {
      const pumpIt = new PumpIt()
      const keyA = 'key_a'
      const keyB = Symbol()
      const keyC = Symbol()

      let resolveCount = 0
      const factory = () => {
        return resolveCount++
      }

      class TestB {
        static inject = [keyA]

        constructor(public keyA: typeof factory) {}
      }
      class TestC {
        static inject = [keyA]

        constructor(public keyA: typeof factory) {}
      }

      pumpIt.bindClass(keyB, TestB)
      pumpIt.bindClass(keyC, TestC)

      pumpIt.bindFactory(keyA, factory, {
        beforeResolve: ({ value: factory }) => {
          return factory()
        },
        scope: SCOPE.SINGLETON
      })

      const factoryResolved = pumpIt.resolve<ReturnType<typeof factory>>(keyA)
      const instanceB = pumpIt.resolve<TestB>(keyB)
      const instanceC = pumpIt.resolve<TestC>(keyC)

      expect(resolveCount).toBe(1)
      expect(instanceB.keyA).toBe(factoryResolved)
      expect(instanceC.keyA).toBe(factoryResolved)
    })

    test('runs every time when the scope is "transient"', () => {
      const pumpIt = new PumpIt()
      const keyA = 'key_a'
      const keyB = Symbol()
      const keyC = Symbol()

      let resolveCount = 0
      const factory = () => {
        return resolveCount++
      }

      class TestB {
        static inject = [keyA]

        constructor(public keyA: typeof factory) {}
      }
      class TestC {
        static inject = [keyA, keyB]

        constructor(public keyA: typeof factory, public keyB: TestB) {}
      }

      pumpIt
        .bindClass(keyB, TestB)
        .bindClass(keyC, TestC)
        .bindFactory(keyA, factory, {
          beforeResolve: ({ value: factory }) => {
            return factory()
          },
          scope: SCOPE.TRANSIENT
        })

      pumpIt.resolve<TestC>(keyC)

      expect(resolveCount).toBe(2)
    })

    test('runs once per resolve request when the scope is "request"', () => {
      const pumpIt = new PumpIt()
      const keyA = 'key_a'
      const keyB = Symbol()
      const keyC = Symbol()

      let resolveCount = 0
      const factory = () => {
        return resolveCount++
      }

      class TestB {
        static inject = [keyA]

        constructor(public keyA: typeof factory) {}
      }
      class TestC {
        static inject = [keyA, keyB]

        constructor(public keyA: typeof factory, public keyB: TestB) {}
      }

      pumpIt
        .bindClass(keyB, TestB)
        .bindClass(keyC, TestC)
        .bindFactory(keyA, factory, {
          beforeResolve: ({ value: factory }) => {
            return factory()
          },
          scope: SCOPE.REQUEST
        })

      pumpIt.resolve<TestC>(keyC)

      expect(resolveCount).toBe(1)
    })
  })
  describe('After resolve', () => {
    test('receives correct parameters', () => {
      const pumpIt = new PumpIt()
      const keyA = 'key_a'

      const resolveCallbackData = { foo: 'bar' }
      const afterResolve = jest.fn()

      const factoryReturnValue = {}
      const factory = () => factoryReturnValue
      pumpIt.bindFactory(keyA, factory, {
        afterResolve
      })

      pumpIt.resolve(keyA, { data: resolveCallbackData })

      expect(afterResolve).toHaveBeenCalledWith({
        container: pumpIt,
        value: factoryReturnValue,
        ctx: {
          data: resolveCallbackData
        }
      })
    })

    test('runs once when the scope is "singleton"', () => {
      const pumpIt = new PumpIt()
      const keyA = 'key_a'
      const keyB = Symbol()
      const keyC = Symbol()

      const factory = () => {}

      const afterResolve = jest.fn()

      class TestB {
        static inject = [keyA]

        constructor(public keyA: typeof factory) {}
      }
      class TestC {
        static inject = [keyA]

        constructor(public keyA: typeof factory) {}
      }

      pumpIt.bindClass(keyB, TestB)
      pumpIt.bindClass(keyC, TestC)
      pumpIt.bindFactory(keyA, factory, {
        afterResolve,
        scope: SCOPE.SINGLETON
      })

      pumpIt.resolve<ReturnType<typeof factory>>(keyA)
      pumpIt.resolve<TestB>(keyB)
      pumpIt.resolve<TestC>(keyC)

      expect(afterResolve).toHaveBeenCalledTimes(1)
    })

    test('runs every time when the scope is "transient"', () => {
      const pumpIt = new PumpIt()
      const keyA = 'key_a'
      const keyB = Symbol()
      const keyC = Symbol()

      const afterResolve = jest.fn()
      const factory = () => {}

      class TestB {
        static inject = [keyA]

        constructor(public keyA: typeof factory) {}
      }
      class TestC {
        static inject = [keyA, keyB]

        constructor(public keyA: typeof factory, public keyB: TestB) {}
      }

      pumpIt
        .bindClass(keyB, TestB)
        .bindClass(keyC, TestC)
        .bindFactory(keyA, factory, {
          afterResolve,
          scope: SCOPE.TRANSIENT
        })

      pumpIt.resolve<TestC>(keyC)

      expect(afterResolve).toBeCalledTimes(2)
    })

    test('runs once per resolve request when the scope is "request"', () => {
      const pumpIt = new PumpIt()
      const factoryKey = 'key_a'
      const keyB = Symbol()
      const keyC = Symbol()

      const afterResolve = jest.fn()
      const factory = () => {}

      class TestB {
        static inject = [factoryKey]

        constructor(public factoryKey: typeof factory) {}
      }
      class TestC {
        static inject = [factoryKey, keyB]

        constructor(public factoryKey: typeof factory, public keyB: TestB) {}
      }

      pumpIt
        .bindClass(keyB, TestB)
        .bindClass(keyC, TestC)
        .bindFactory(factoryKey, factory, {
          afterResolve,
          scope: SCOPE.REQUEST
        })

      pumpIt.resolve<TestC>(keyC)

      expect(afterResolve).toHaveBeenCalledTimes(1)
    })
  })
})
