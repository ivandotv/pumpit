import { Pumpa, SCOPE } from '../../pumpa'

describe('Factory with the scope: request', () => {
  test('return the same factory for a single resolve call', () => {
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
      .bindFactory(request_key, factory, { scope: SCOPE.REQUEST })
      .bindClass(keyA, TestA)
      .bindClass(keyB, TestB)
      .bindClass(keyC, TestC)

    const instance = pumpa.resolve<TestC>(keyC)

    expect(count).toBe(1)
    expect(instance.request).toBe(instance.keyA.request)
    expect(instance.request).toBe(instance.keyB.request)
    expect(instance.keyA.request).toBe(instance.keyB.request)
  })

  test('multiple resolve calls return different factories', () => {
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

    pumpa.bindFactory(key, factory, { scope: SCOPE.REQUEST })

    const instanceA = pumpa.resolve<Fn>(key)
    const instanceB = pumpa.resolve<Fn>(key)

    expect(instanceA).not.toBe(instanceB)
    expect(count).toBe(2)
  })
})
