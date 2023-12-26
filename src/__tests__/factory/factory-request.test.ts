import { describe, expect, test } from 'vitest'
import { PumpIt, SCOPE } from '../../pumpit'

describe('Factory with the scope: request', () => {
  test('return the same factory for a single resolve call', () => {
    const pumpIt = new PumpIt()

    const keyA = 'key_a'
    const keyB = 'key_b'
    const keyC = 'key_c'
    const request_key = 'request'

    let count = 0

    type Fn = ReturnType<typeof factory>
    function factory() {
      count++

      return () => {
        return count
      }
    }

    class TestA {
      static inject = [request_key]

      constructor(public request: Fn) {}
    }

    class TestB {
      static inject = [request_key]

      constructor(public request: Fn) {}
    }

    class TestC {
      static inject = [keyA, keyB, request_key]

      constructor(
        public keyA: TestA,
        public keyB: TestB,
        public request: Fn
      ) {}
    }

    pumpIt
      .bindFactory(request_key, factory, { scope: SCOPE.REQUEST })
      .bindClass(keyA, TestA)
      .bindClass(keyB, TestB)
      .bindClass(keyC, TestC)

    const instance = pumpIt.resolve<TestC>(keyC)

    expect(count).toBe(1)
    expect(instance.request).toBe(instance.keyA.request)
    expect(instance.request).toBe(instance.keyB.request)
    expect(instance.keyA.request).toBe(instance.keyB.request)
  })

  test('multiple resolve calls return different factories', () => {
    const pumpIt = new PumpIt()
    const key = 'some_key'

    let count = 0

    type Fn = ReturnType<typeof factory>
    function factory() {
      count++

      return () => {
        return count
      }
    }

    pumpIt.bindFactory(key, factory, { scope: SCOPE.REQUEST })

    const instanceA = pumpIt.resolve<Fn>(key)
    const instanceB = pumpIt.resolve<Fn>(key)

    expect(instanceA).not.toBe(instanceB)
    expect(count).toBe(2)
  })
})
