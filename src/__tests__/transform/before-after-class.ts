import { Pumpa, SCOPE } from '../../pumpa'
import { transform } from '../../utils'

describe('Resolve transform class', () => {
  describe('Before resolve', () => {
    test('receives correct parameters', () => {
      const pumpa = new Pumpa()
      const keyA = 'key_a'
      const keyB = Symbol()
      const valueB = { name: 'Ivan' }

      class TestA {
        static inject = [keyB]

        constructor(public keyB: typeof valueB) {}
      }

      pumpa.bindValue(keyB, valueB)
      pumpa.bindClass(keyA, TestA, {
        beforeResolve: ({ ctx: injector, value: constructor, deps }) => {
          expect(injector).toBe(pumpa)
          expect(constructor).toBe(TestA)
          expect(deps).toEqual([valueB])

          return new constructor(...deps)
        }
      })

      const instance = pumpa.resolve<TestA>(keyA)

      expect.assertions(4)
      expect(instance.keyB).toBe(valueB)
    })

    test('receives correct parameters after injection transform', () => {
      const pumpa = new Pumpa()
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

      pumpa.bindValue(keyB, valueB)
      pumpa.bindClass(keyA, TestA, {
        beforeResolve: ({ ctx: injector, value: constructor, deps }) => {
          expect(injector).toBe(pumpa)
          expect(constructor).toBe(TestA)
          expect(deps).toEqual([transformedValue])

          return new constructor(...deps)
        }
      })

      const instance = pumpa.resolve<TestA>(keyA)

      expect.assertions(4)
      expect(instance.keyB).toBe(transformedValue)
    })

    test('Creates new instance', () => {
      const pumpa = new Pumpa()
      const keyA = 'key_a'
      const keyB = Symbol()

      const valueB = { name: 'Ivan' }
      const substituteValue = { name: 'Marco' }
      class TestA {
        static inject = [keyB]

        constructor(public keyB: typeof valueB) {}
      }

      pumpa.bindValue(keyB, valueB)
      pumpa.bindClass(keyA, TestA, {
        beforeResolve: ({ value: constructor }) => {
          return new constructor(substituteValue)
        }
      })

      const instance = pumpa.resolve<TestA>(keyA)

      expect(instance.keyB).toBe(substituteValue)
      expect(instance).toBeInstanceOf(TestA)
    })

    test('Runs once when the scope is "singleton"', () => {
      const pumpa = new Pumpa()
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

      pumpa.bindClass(keyB, TestB)
      pumpa.bindClass(keyC, TestC)
      pumpa.bindClass(keyA, TestA, {
        beforeResolve: ({ value: constructor }) => {
          resolveCount = resolveCount + 1

          return new constructor()
        },
        scope: SCOPE.SINGLETON
      })

      const instance = pumpa.resolve<TestA>(keyA)
      const instanceB = pumpa.resolve<TestB>(keyB)
      const instanceC = pumpa.resolve<TestC>(keyC)

      expect(TestA.count).toBe(1)
      expect(resolveCount).toBe(1)
      expect(instanceB.keyA).toBe(instance)
      expect(instanceC.keyA).toBe(instance)
    })

    test('Run every time when scope is "transient"', () => {
      const pumpa = new Pumpa()
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

      pumpa.bindClass(keyB, TestB)
      pumpa.bindClass(keyC, TestC)
      pumpa.bindClass(keyA, TestA, {
        beforeResolve: ({ value: constructor }) => {
          resolveCount = resolveCount + 1

          return new constructor()
        },
        scope: SCOPE.TRANSIENT
      })

      pumpa.resolve<TestA>(keyA)
      pumpa.resolve<TestC>(keyC)

      expect(TestA.count).toBe(3)
      expect(resolveCount).toBe(3)
    })

    test('Run once per resolve request when scope is "request"', () => {
      const pumpa = new Pumpa()
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

      pumpa.bindClass(keyB, TestB)
      pumpa.bindClass(keyC, TestC)
      pumpa.bindClass(keyA, TestA, {
        beforeResolve: ({ value: constructor }) => {
          resolveCount = resolveCount + 1

          return new constructor()
        },
        scope: SCOPE.REQUEST
      })

      pumpa.resolve<TestA>(keyA)
      pumpa.resolve<TestC>(keyC)

      expect(TestA.count).toBe(2)
      expect(resolveCount).toBe(2)
    })
  })
  describe('After resolve', () => {
    test('receives correct parameters', () => {
      const pumpa = new Pumpa()
      const keyA = 'key_a'
      const keyB = Symbol()
      const valueB = { name: 'Ivan' }

      class TestA {
        static inject = [keyB]

        constructor(public keyB: typeof valueB) {}
      }

      const afterResolve = jest.fn()

      pumpa.bindValue(keyB, valueB)
      pumpa.bindClass(keyA, TestA, {
        afterResolve
      })

      const instance = pumpa.resolve<TestA>(keyA)

      expect(afterResolve).toHaveBeenCalledWith({ value: instance })
    })

    test('Runs once when the scope is "singleton"', () => {
      const pumpa = new Pumpa()
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

      pumpa.bindClass(keyB, TestB)
      pumpa.bindClass(keyC, TestC)
      pumpa.bindClass(keyA, TestA, {
        afterResolve: () => {
          resolveCount = resolveCount + 1
        },
        scope: SCOPE.SINGLETON
      })

      pumpa.resolve<TestA>(keyA)
      pumpa.resolve<TestB>(keyB)
      pumpa.resolve<TestC>(keyC)

      expect(TestA.count).toBe(1)
      expect(resolveCount).toBe(1)
    })

    test('Run every time when the scope is "transient"', () => {
      const pumpa = new Pumpa()
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

      pumpa.bindClass(keyB, TestB)
      pumpa.bindClass(keyC, TestC)
      pumpa.bindClass(keyA, TestA, {
        afterResolve: () => {
          resolveCount = resolveCount + 1
        },
        scope: SCOPE.TRANSIENT
      })

      pumpa.resolve<TestA>(keyA)
      pumpa.resolve<TestC>(keyC)

      expect(TestA.count).toBe(3)
      expect(resolveCount).toBe(3)
    })

    test('Run once per resolve request when scope is "request"', () => {
      const pumpa = new Pumpa()
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

      pumpa.bindClass(keyB, TestB)
      pumpa.bindClass(keyC, TestC)
      pumpa.bindClass(keyA, TestA, {
        afterResolve: () => {
          resolveCount = resolveCount + 1
        },
        scope: SCOPE.REQUEST
      })

      pumpa.resolve<TestA>(keyA)
      pumpa.resolve<TestC>(keyC)

      expect(TestA.count).toBe(2)
      expect(resolveCount).toBe(2)
    })
  })
})
