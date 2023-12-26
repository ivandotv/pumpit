import { describe, expect, test } from 'vitest'
import { PROXY_TARGET } from '../proxy'
import { PumpIt, SCOPE } from '../pumpit'
import { get, getArray } from '../utils'

describe('Circular dependency', () => {
  test('throw when circular reference is detected', () => {
    const pumpIt = new PumpIt()
    const keyA = 'key_a'
    const keyB = Symbol('key_b')
    const keyC = 'key_c'

    class TestA {
      static inject = [keyB]
    }
    class TestB {
      static inject = [keyC]
    }
    class TestC {
      static inject = [keyA]
    }

    pumpIt.bindClass(keyA, TestA).bindClass(keyB, TestB).bindClass(keyC, TestC)

    expect(() => pumpIt.resolve<TestA>(keyA)).toThrow(
      'Circular reference detected'
    )
  })

  describe('Lazy injection', () => {
    test('inject on one side', () => {
      const pumpIt = new PumpIt()
      const keyA = 'key_a'
      const keyB = Symbol('key_b')

      const staticResult = 'hello'
      class TestA {
        static inject = [keyB]

        static hello() {
          return staticResult
        }

        constructor(public keyB: TestB) {}
      }
      class TestB {
        static inject = [get(keyA, { lazy: true })]

        constructor(public keyA: TestA) {}
      }

      pumpIt.bindClass(keyA, TestA).bindClass(keyB, TestB)

      const instance = pumpIt.resolve<TestA>(keyA)

      expect(instance).toBeInstanceOf(TestA)
      expect(instance.keyB).toBeInstanceOf(TestB)
      expect(instance.keyB.keyA).toBeInstanceOf(TestA)
      // @ts-expect-error - call function constructor
      expect(new instance.keyB.keyA.constructor()).toBeInstanceOf(TestA)
      expect(instance.keyB.keyA[PROXY_TARGET]).toBe(instance)
      // @ts-expect-error - call static via constructor
      expect(instance.keyB.keyA.constructor.hello()).toBe(staticResult)
    })

    test('inject on both sides', () => {
      const pumpIt = new PumpIt()
      const keyA = 'key_a'
      const keyB = Symbol('key_b')

      const staticResult = 'hello'
      class TestA {
        static inject = [get(keyB, { lazy: true })]

        static hello() {
          return staticResult
        }

        constructor(public keyB: TestB) {}
      }
      class TestB {
        static inject = [get(keyA, { lazy: true })]

        constructor(public keyA: TestA) {}
      }

      pumpIt.bindClass(keyA, TestA).bindClass(keyB, TestB)

      const instance = pumpIt.resolve<TestA>(keyA)

      expect(instance).toBeInstanceOf(TestA)
      expect(instance.keyB).toBeInstanceOf(TestB)
      expect(instance.keyB.keyA).toBeInstanceOf(TestA)
      // @ts-expect-error - call function constructor
      expect(new instance.keyB.keyA.constructor()).toBeInstanceOf(TestA)
      expect(instance.keyB.keyA[PROXY_TARGET]).toBe(instance)
      // @ts-expect-error - call static via constructor
      expect(instance.keyB.keyA.constructor.hello()).toBe(staticResult)
    })

    test('inject on both sides - object key - value', () => {
      const pumpIt = new PumpIt()
      const keyA = 'key_a'
      const keyB = Symbol('key_b')

      const staticResult = 'hello'
      class TestA {
        static inject = [get(keyB, { lazy: true })]

        static hello() {
          return staticResult
        }

        constructor(public keyB: TestB) {}
      }
      class TestB {
        constructor(public keyA: TestA) {}
      }

      pumpIt
        .bindClass(keyB, { value: TestB, inject: [get(keyA, { lazy: true })] })
        .bindClass(keyA, { value: TestA, inject: [get(keyB, { lazy: true })] })

      const instance = pumpIt.resolve<TestA>(keyA)

      expect(instance).toBeInstanceOf(TestA)
      expect(instance.keyB).toBeInstanceOf(TestB)
      expect(instance.keyB.keyA).toBeInstanceOf(TestA)
      // @ts-expect-error - call function constructor
      expect(new instance.keyB.keyA.constructor()).toBeInstanceOf(TestA)
      expect(instance.keyB.keyA[PROXY_TARGET]).toBe(instance)
      // @ts-expect-error - call static via constructor
      expect(instance.keyB.keyA.constructor.hello()).toBe(staticResult)
    })

    test('inject class singleton', () => {
      const pumpIt = new PumpIt()
      const keyA = 'key_a'
      const keyB = Symbol('key_b')
      const keyC = 'key_c'

      class TestA {
        static inject = [get(keyB, { lazy: true })]

        constructor(public keyB: TestB) {}
      }

      class TestB {
        static inject = [get(keyC, { lazy: true }), get(keyA)]

        constructor(
          public keyC: TestC,
          public keyA: TestA
        ) {}
      }

      class TestC {
        static inject = [get(keyB, { lazy: true }), get(keyA, { lazy: true })]

        constructor(public keyB: TestB) {}
      }

      pumpIt
        .bindClass(keyA, TestA, { scope: SCOPE.SINGLETON })
        .bindClass(keyB, TestB, { scope: SCOPE.SINGLETON })
        .bindClass(keyC, TestC)

      const instance = pumpIt.resolve<TestB>(keyB)
      const instanceTwo = pumpIt.resolve<TestB>(keyB)

      expect(instance).toBeInstanceOf(TestB)
      expect(instance.keyC).toBeInstanceOf(TestC)
      expect(instance.keyC.keyB).toBeInstanceOf(TestB)
      expect(instance.keyC.keyB[PROXY_TARGET]).toBe(instance)

      expect(instance.keyA).toBeInstanceOf(TestA)
      expect(instance.keyA.keyB[PROXY_TARGET]).toBe(instance)

      expect(instanceTwo).toBe(instance)
      expect(instanceTwo.keyC.keyB[PROXY_TARGET]).toBe(instance)
      expect(instanceTwo.keyA.keyB[PROXY_TARGET]).toBe(instance)
    })

    test('inject in to factory', () => {
      const pumpIt = new PumpIt()
      const keyA = 'key_a'
      const keyB = Symbol('key_b')

      const resultA = 'A executed'
      const resultB = 'B executed'

      function factoryA(fn: { (): any; result: string }) {
        return () => {
          return {
            fn,
            result: resultA
          }
        }
      }

      factoryA.inject = [keyB]

      function factoryB(fn: { (): any; result: string }) {
        return () => {
          return {
            fn,
            result: resultB
          }
        }
      }

      factoryB.inject = [get(keyA, { lazy: true })]

      pumpIt.bindFactory(keyA, factoryA)
      pumpIt.bindFactory(keyB, factoryB)

      const resolvedFactoryA =
        pumpIt.resolve<() => { fn: () => any; result: string }>(keyA)

      expect(resolvedFactoryA().result).toBe(resultA)
      expect(resolvedFactoryA().fn().result).toBe(resultB)
      expect(resolvedFactoryA().fn().fn().result).toBe(resultA)
    })

    test('inject with arrays', () => {
      const pumpIt = new PumpIt()
      const keyA = 'key_a'
      const keyB = Symbol('key_b')
      const keyC = 'key_c'

      class TestA {
        static inject = [get(keyB, { lazy: true })]

        constructor(public keyB: TestB) {}
      }
      class TestB {
        static inject = [getArray([get(keyC, { lazy: true }), get(keyA)])]

        constructor(public data: [TestC, TestA]) {}
      }
      class TestC {
        static inject = [get(keyB, { lazy: true })]

        constructor(public keyB: TestB) {}
      }

      pumpIt
        .bindClass(keyA, TestA)
        .bindClass(keyB, TestB)
        .bindClass(keyC, TestC)

      const instance = pumpIt.resolve<TestB>(keyB)

      expect(instance).toBeInstanceOf(TestB)
      expect(instance.data[0]).toBeInstanceOf(TestC)
      expect(instance.data[0].keyB).toBeInstanceOf(TestB)
      expect(instance.data[0].keyB[PROXY_TARGET]).toBe(instance)

      expect(instance.data[1]).toBeInstanceOf(TestA)
      expect(instance.data[1].keyB).toBeInstanceOf(TestB)
      expect(instance.data[1].keyB[PROXY_TARGET]).toBe(instance)
    })
  })
})
