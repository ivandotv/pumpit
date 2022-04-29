import { Pumpa, SCOPE } from '../../pumpa'

describe('Factory with "transient" scope', () => {
  test('Default scope is "transient"', () => {
    const pumpa = new Pumpa()
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

      constructor(public fn: Fn, public fnCopy: Fn, public b: TestB) {}
    }

    pumpa
      .bindFactory(key, factory)
      .bindClass(keyB, TestB)
      .bindClass(keyC, TestC)

    const instance = pumpa.resolve<TestC>(keyC)

    expect(instance.fn).not.toBe(instance.fnCopy)
    expect(count).toBe(3)
  })

  test('Explicitly pass "transient" scope', () => {
    const pumpa = new Pumpa()
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

      constructor(public fn: Fn, public fnCopy: Fn, public b: TestB) {}
    }

    pumpa
      .bindFactory(key, factory, { scope: SCOPE.TRANSIENT })
      .bindClass(keyB, TestB)
      .bindClass(keyC, TestC)

    const instance = pumpa.resolve<TestC>(keyC)

    expect(instance.fn).not.toBe(instance.fnCopy)
    expect(count).toBe(3)
  })
})
