/* eslint-disable @typescript-eslint/no-empty-function */
import { Pumpa, SCOPE } from '../../pumpa'

describe('Resolve transform factory', () => {
  describe('Before resolve', () => {
    test('receives correct parameters', () => {
      const pumpa = new Pumpa()
      const keyA = 'key_a'
      const keyB = Symbol()
      const valueB = { name: 'Ivan' }

      const factoryValue = (keyB: typeof valueB) => keyB

      factoryValue.inject = [keyB]

      pumpa.bindValue(keyB, valueB)
      pumpa.bindFactory(keyA, factoryValue, {
        beforeResolve: ({ ctx: injector, value: factory, deps }) => {
          expect(injector).toBe(pumpa)
          expect(factory).toBe(factory)
          expect(deps).toEqual([valueB])

          return factory(...deps)
        }
      })

      const resolved = pumpa.resolve<typeof factoryValue>(keyA)

      expect.assertions(4)
      expect(resolved).toBe(valueB)
    })

    test('returns custom value', () => {
      const pumpa = new Pumpa()
      const keyA = 'key_a'
      const substituteValue = { name: 'Marco' }

      const factoryValue = () => {}

      pumpa.bindFactory(keyA, factoryValue, {
        beforeResolve: () => {
          return substituteValue
        }
      })

      const instance = pumpa.resolve(keyA)

      expect(instance).toBe(substituteValue)
    })

    test('Runs once when the scope is "singleton"', () => {
      const pumpa = new Pumpa()
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

      pumpa.bindClass(keyB, TestB)
      pumpa.bindClass(keyC, TestC)

      pumpa.bindFactory(keyA, factory, {
        beforeResolve: ({ value: factory }) => {
          return factory()
        },
        scope: SCOPE.SINGLETON
      })

      const factoryResolved = pumpa.resolve<ReturnType<typeof factory>>(keyA)
      const instanceB = pumpa.resolve<TestB>(keyB)
      const instanceC = pumpa.resolve<TestC>(keyC)

      expect(resolveCount).toBe(1)
      expect(instanceB.keyA).toBe(factoryResolved)
      expect(instanceC.keyA).toBe(factoryResolved)
    })

    test('Runs every time when the scope is "transient"', () => {
      const pumpa = new Pumpa()
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

      pumpa
        .bindClass(keyB, TestB)
        .bindClass(keyC, TestC)
        .bindFactory(keyA, factory, {
          beforeResolve: ({ value: factory }) => {
            return factory()
          },
          scope: SCOPE.TRANSIENT
        })

      pumpa.resolve<TestC>(keyC)

      expect(resolveCount).toBe(2)
    })

    test('Runs once per resolve request when the scope is "request"', () => {
      const pumpa = new Pumpa()
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

      pumpa
        .bindClass(keyB, TestB)
        .bindClass(keyC, TestC)
        .bindFactory(keyA, factory, {
          beforeResolve: ({ value: factory }) => {
            return factory()
          },
          scope: SCOPE.REQUEST
        })

      pumpa.resolve<TestC>(keyC)

      expect(resolveCount).toBe(1)
    })
  })
  describe('After resolve', () => {
    test('receives correct parameters', () => {
      const pumpa = new Pumpa()
      const keyA = 'key_a'

      const afterResolve = jest.fn()

      const factoryReturnValue = {}
      const factory = () => factoryReturnValue
      pumpa.bindFactory(keyA, factory, {
        afterResolve
      })

      pumpa.resolve(keyA)

      expect(afterResolve).toHaveBeenCalledWith({ value: factoryReturnValue })
    })

    test('Runs once when the scope is "singleton"', () => {
      const pumpa = new Pumpa()
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

      pumpa.bindClass(keyB, TestB)
      pumpa.bindClass(keyC, TestC)
      pumpa.bindFactory(keyA, factory, {
        afterResolve,
        scope: SCOPE.SINGLETON
      })

      pumpa.resolve<ReturnType<typeof factory>>(keyA)
      pumpa.resolve<TestB>(keyB)
      pumpa.resolve<TestC>(keyC)

      expect(afterResolve).toHaveBeenCalledTimes(1)
    })

    test('Runs every time when the scope is "transient"', () => {
      const pumpa = new Pumpa()
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

      pumpa
        .bindClass(keyB, TestB)
        .bindClass(keyC, TestC)
        .bindFactory(keyA, factory, {
          afterResolve,
          scope: SCOPE.TRANSIENT
        })

      pumpa.resolve<TestC>(keyC)

      expect(afterResolve).toBeCalledTimes(2)
    })

    test('Runs once per resolve request when the scope is "request"', () => {
      const pumpa = new Pumpa()
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

      pumpa
        .bindClass(keyB, TestB)
        .bindClass(keyC, TestC)
        .bindFactory(factoryKey, factory, {
          afterResolve,
          scope: SCOPE.REQUEST
        })

      pumpa.resolve<TestC>(keyC)

      expect(afterResolve).toHaveBeenCalledTimes(1)
    })
  })
})
