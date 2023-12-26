import { describe, expect, test } from 'vitest'
import { PumpIt, SCOPE } from '../../pumpit'

describe('Factory with scope: transient', () => {
  test('default scope is "transient"', () => {
    const pumpIt = new PumpIt()
    const key = 'some_key'
    const keyB = 'key_b'
    const keyC = 'key_c'

    let count = 0

    type Fn = ReturnType<typeof factory>
    function factory() {
      count++

      return () => {
        return count
      }
    }

    class TestB {
      static inject = [key]

      constructor(public fn: Fn) {}
    }

    class TestC {
      static inject = [key, key, keyB]

      constructor(
        public fn: Fn,
        public fnCopy: Fn,
        public b: TestB
      ) {}
    }

    pumpIt
      .bindFactory(key, factory)
      .bindClass(keyB, TestB)
      .bindClass(keyC, TestC)

    const instance = pumpIt.resolve<TestC>(keyC)

    expect(instance.fn).not.toBe(instance.fnCopy)
    expect(count).toBe(3)
  })

  test('explicitly pass "transient" scope', () => {
    const pumpIt = new PumpIt()
    const key = 'some_key'
    const keyB = 'key_b'
    const keyC = 'key_c'

    let count = 0

    type Fn = ReturnType<typeof factory>
    function factory() {
      count++

      return () => {
        return count
      }
    }

    class TestB {
      static inject = [key]

      constructor(public fn: Fn) {}
    }

    class TestC {
      static inject = [key, key, keyB]

      constructor(
        public fn: Fn,
        public fnCopy: Fn,
        public b: TestB
      ) {}
    }

    pumpIt
      .bindFactory(key, factory, { scope: SCOPE.TRANSIENT })
      .bindClass(keyB, TestB)
      .bindClass(keyC, TestC)

    const instance = pumpIt.resolve<TestC>(keyC)

    expect(instance.fn).not.toBe(instance.fnCopy)
    expect(count).toBe(3)
  })
})
