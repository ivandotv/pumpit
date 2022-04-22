import { Pumpa, SCOPES } from '../../pumpa'

describe('Factory with "request" scope', () => {
  test('Return the same factory for a single resolve call', () => {
    const pumpa = new Pumpa()

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

      constructor(public keyA: TestA, public keyB: TestB, public request: Fn) {}
    }

    pumpa
      .addFactory(request_key, factory, { scope: SCOPES.REQUEST })
      .addClass(keyA, TestA)
      .addClass(keyB, TestB)
      .addClass(keyC, TestC)

    const instance = pumpa.resolve<TestC>(keyC)

    expect(count).toBe(1)
    expect(instance.request).toBe(instance.keyA.request)
    expect(instance.request).toBe(instance.keyB.request)
    expect(instance.keyA.request).toBe(instance.keyB.request)
  })

  test('Multiple resolve calls return different factories', () => {
    const pumpa = new Pumpa()
    const key = 'some_key'

    let count = 0

    type Fn = ReturnType<typeof factory>
    function factory() {
      count++

      return () => {
        return count
      }
    }

    pumpa.addFactory(key, factory, { scope: SCOPES.REQUEST })

    const instanceA = pumpa.resolve<Fn>(key)
    const instanceB = pumpa.resolve<Fn>(key)

    expect(instanceA).not.toBe(instanceB)
    expect(count).toBe(2)
  })
})
