import { PumpIt, SCOPE } from '../../pumpit'
import { transform } from '../../utils'

describe('Class transform', () => {
  describe('Before resolve', () => {
    test('receives correct parameters', () => {
      const pumpIt = new PumpIt()
      const keyA = 'key_a'
      const keyB = Symbol()
      const valueB = { name: 'Ivan' }
      const resolveCallbackData = { foo: 'bar' }

      class TestA {
        static inject = [keyB]

        constructor(public keyB: typeof valueB) {}
      }

      pumpIt.bindValue(keyB, valueB)

      pumpIt.bindClass(keyA, TestA, {
        beforeResolve: ({
          container: injector,
          value: constructor,
          deps,
          ctx
        }) => {
          expect(injector).toBe(pumpIt)
          expect(constructor).toBe(TestA)
          expect(deps).toEqual([valueB])
          expect(ctx.data).toBe(resolveCallbackData)

          return new constructor(...deps)
        }
      })

      const instance = pumpIt.resolve<TestA>(keyA, {
        data: resolveCallbackData
      })

      expect.assertions(5)
      expect(instance.keyB).toBe(valueB)
    })

    test('receives correct parameters after injection transformation', () => {
      const pumpIt = new PumpIt()
      const keyA = 'key_a'
      const keyB = Symbol()
      const valueB = { name: 'Ivan' }
      const transformedValue = { name: 'Marco' }

      class TestA {
        static inject = transform([keyB], (_keyB) => {
          return [transformedValue]
        })

        constructor(public keyB: typeof valueB) {}
      }

      pumpIt.bindValue(keyB, valueB)
      pumpIt.bindClass(keyA, TestA, {
        beforeResolve: ({ container: injector, value: constructor, deps }) => {
          expect(injector).toBe(pumpIt)
          expect(constructor).toBe(TestA)
          expect(deps).toEqual([transformedValue])

          return new constructor(...deps)
        }
      })

      const instance = pumpIt.resolve<TestA>(keyA)

      expect.assertions(4)
      expect(instance.keyB).toBe(transformedValue)
    })

    test('Creates new instance', () => {
      const pumpIt = new PumpIt()
      const keyA = 'key_a'
      const keyB = Symbol()

      const valueB = { name: 'Ivan' }
      const substituteValue = { name: 'Marco' }
      class TestA {
        static inject = [keyB]

        constructor(public keyB: typeof valueB) {}
      }

      pumpIt.bindValue(keyB, valueB)
      pumpIt.bindClass(keyA, TestA, {
        beforeResolve: ({ value: constructor }) => {
          return new constructor(substituteValue)
        }
      })

      const instance = pumpIt.resolve<TestA>(keyA)

      expect(instance.keyB).toBe(substituteValue)
      expect(instance).toBeInstanceOf(TestA)
    })

    test('Runs once when the scope is "singleton"', () => {
      const pumpIt = new PumpIt()
      const keyA = 'key_a'
      const keyB = Symbol()
      const keyC = Symbol()

      let resolveCount = 0

      class TestA {
        static count = 0

        constructor() {
          TestA.count++
        }
      }

      class TestB {
        static inject = [keyA]

        constructor(public keyA: TestA) {}
      }
      class TestC {
        static inject = [keyA]

        constructor(public keyA: TestA) {}
      }

      pumpIt.bindClass(keyB, TestB)
      pumpIt.bindClass(keyC, TestC)
      pumpIt.bindClass(keyA, TestA, {
        beforeResolve: ({ value: constructor }) => {
          resolveCount = resolveCount + 1

          return new constructor()
        },
        scope: SCOPE.SINGLETON
      })

      const instance = pumpIt.resolve<TestA>(keyA)
      const instanceB = pumpIt.resolve<TestB>(keyB)
      const instanceC = pumpIt.resolve<TestC>(keyC)

      expect(TestA.count).toBe(1)
      expect(resolveCount).toBe(1)
      expect(instanceB.keyA).toBe(instance)
      expect(instanceC.keyA).toBe(instance)
    })

    test('Runs every time when the scope is "transient"', () => {
      const pumpIt = new PumpIt()
      const keyA = 'key_a'
      const keyB = Symbol()
      const keyC = Symbol()

      let resolveCount = 0

      class TestA {
        static count = 0

        constructor() {
          TestA.count++
        }
      }

      class TestB {
        static inject = [keyA]

        constructor(public keyA: TestA) {}
      }

      class TestC {
        static inject = [keyA, keyB]

        constructor(public keyA: TestA, public keyB: TestB) {}
      }

      pumpIt.bindClass(keyB, TestB)
      pumpIt.bindClass(keyC, TestC)
      pumpIt.bindClass(keyA, TestA, {
        beforeResolve: ({ value: constructor }) => {
          resolveCount = resolveCount + 1

          return new constructor()
        },
        scope: SCOPE.TRANSIENT
      })

      pumpIt.resolve<TestA>(keyA)
      pumpIt.resolve<TestC>(keyC)

      expect(TestA.count).toBe(3)
      expect(resolveCount).toBe(3)
    })

    test('Run once per resolve request when this scope is "request"', () => {
      const pumpIt = new PumpIt()
      const keyA = 'key_a'
      const keyB = Symbol()
      const keyC = Symbol()

      let resolveCount = 0

      class TestA {
        static count = 0

        constructor() {
          TestA.count++
        }
      }

      class TestB {
        static inject = [keyA]

        constructor(public keyA: TestA) {}
      }

      class TestC {
        static inject = [keyA, keyB]

        constructor(public keyA: TestA, public keyB: TestB) {}
      }

      pumpIt.bindClass(keyB, TestB)
      pumpIt.bindClass(keyC, TestC)
      pumpIt.bindClass(keyA, TestA, {
        beforeResolve: ({ value: constructor }) => {
          resolveCount = resolveCount + 1

          return new constructor()
        },
        scope: SCOPE.REQUEST
      })

      pumpIt.resolve<TestA>(keyA)
      pumpIt.resolve<TestC>(keyC)

      expect(TestA.count).toBe(2)
      expect(resolveCount).toBe(2)
    })
  })
  describe('After resolve', () => {
    test('Receives correct parameters', () => {
      const pumpIt = new PumpIt()
      const keyA = 'key_a'
      const keyB = Symbol()
      const valueB = { name: 'Ivan' }
      const resolveCallbackData = { foo: 'bar' }

      class TestA {
        static inject = [keyB]

        constructor(public keyB: typeof valueB) {}
      }

      const afterResolve = jest.fn()

      pumpIt.bindValue(keyB, valueB)
      pumpIt.bindClass(keyA, TestA, {
        afterResolve
      })

      const instance = pumpIt.resolve<TestA>(keyA, {
        data: resolveCallbackData
      })

      expect(afterResolve).toHaveBeenCalledWith({
        container: pumpIt,
        value: instance,
        ctx: { data: resolveCallbackData }
      })
    })

    test('Runs once when the scope is "singleton"', () => {
      const pumpIt = new PumpIt()
      const keyA = 'key_a'
      const keyB = Symbol()
      const keyC = Symbol()

      let resolveCount = 0

      class TestA {
        static count = 0

        constructor() {
          TestA.count++
        }
      }

      class TestB {
        static inject = [keyA]

        constructor(public keyA: TestA) {}
      }
      class TestC {
        static inject = [keyA]

        constructor(public keyA: TestA) {}
      }

      pumpIt.bindClass(keyB, TestB)
      pumpIt.bindClass(keyC, TestC)
      pumpIt.bindClass(keyA, TestA, {
        afterResolve: () => {
          resolveCount = resolveCount + 1
        },
        scope: SCOPE.SINGLETON
      })

      pumpIt.resolve<TestA>(keyA)
      pumpIt.resolve<TestB>(keyB)
      pumpIt.resolve<TestC>(keyC)

      expect(TestA.count).toBe(1)
      expect(resolveCount).toBe(1)
    })

    test('Runs every time when the scope is "transient"', () => {
      const pumpIt = new PumpIt()
      const keyA = 'key_a'
      const keyB = Symbol()
      const keyC = Symbol()

      let resolveCount = 0

      class TestA {
        static count = 0

        constructor() {
          TestA.count++
        }
      }

      class TestB {
        static inject = [keyA]

        constructor(public keyA: TestA) {}
      }

      class TestC {
        static inject = [keyA, keyB]

        constructor(public keyA: TestA, public keyB: TestB) {}
      }

      pumpIt.bindClass(keyB, TestB)
      pumpIt.bindClass(keyC, TestC)
      pumpIt.bindClass(keyA, TestA, {
        afterResolve: () => {
          resolveCount = resolveCount + 1
        },
        scope: SCOPE.TRANSIENT
      })

      pumpIt.resolve<TestA>(keyA)
      pumpIt.resolve<TestC>(keyC)

      expect(TestA.count).toBe(3)
      expect(resolveCount).toBe(3)
    })

    test('Runs once per resolve request when the scope is "request"', () => {
      const pumpIt = new PumpIt()
      const keyA = 'key_a'
      const keyB = Symbol()
      const keyC = Symbol()

      let resolveCount = 0

      class TestA {
        static count = 0

        constructor() {
          TestA.count++
        }
      }

      class TestB {
        static inject = [keyA]

        constructor(public keyA: TestA) {}
      }

      class TestC {
        static inject = [keyA, keyB]

        constructor(public keyA: TestA, public keyB: TestB) {}
      }

      pumpIt.bindClass(keyB, TestB)
      pumpIt.bindClass(keyC, TestC)
      pumpIt.bindClass(keyA, TestA, {
        afterResolve: () => {
          resolveCount = resolveCount + 1
        },
        scope: SCOPE.REQUEST
      })

      pumpIt.resolve<TestA>(keyA)
      pumpIt.resolve<TestC>(keyC)

      expect(TestA.count).toBe(2)
      expect(resolveCount).toBe(2)
    })
  })
})
