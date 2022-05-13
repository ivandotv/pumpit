import { PumpIt, SCOPE } from '../../pumpit'

describe('Class with scope: request', () => {
  test('return the same instance for a single resolve call', () => {
    const pumpIt = new PumpIt()

    const keyA = 'key_a'
    const keyB = 'key_b'
    const keyC = 'key_c'
    const request_key = 'request'

    class RequestTest {}
    class TestA {
      static inject = [request_key]

      constructor(public request: RequestTest) {}
    }
    class TestB {
      static inject = [request_key]

      constructor(public request: RequestTest) {}
    }
    class TestC {
      static inject = [keyA, keyB, request_key]

      constructor(
        public keyA: TestA,
        public keyB: TestB,
        public request: RequestTest
      ) {}
    }

    pumpIt
      .bindClass(request_key, RequestTest, { scope: SCOPE.REQUEST })
      .bindClass(keyA, TestA)
      .bindClass(keyB, TestB)
      .bindClass(keyC, TestC)

    const instanceC = pumpIt.resolve<TestC>(keyC)

    expect(instanceC.keyB).toBeInstanceOf(TestB)
    expect(instanceC.keyA).toBeInstanceOf(TestA)
    expect(instanceC.request).toBeInstanceOf(RequestTest)

    expect(instanceC.request).toBe(instanceC.keyA.request)
    expect(instanceC.request).toBe(instanceC.keyB.request)
    expect(instanceC.keyA.request).toBe(instanceC.keyB.request)
  })

  test('multiple resolve calls return different instances', () => {
    const pumpIt = new PumpIt()
    const key = 'some_key'
    class TestA {}

    pumpIt.bindClass(key, TestA, { scope: SCOPE.REQUEST })

    const instanceA = pumpIt.resolve(key)
    const instanceB = pumpIt.resolve(key)

    expect(instanceA).toBeInstanceOf(TestA)
    expect(instanceA).not.toBe(instanceB)
  })

  test('multiple resolve calls return different injected instances', () => {
    const pumpIt = new PumpIt()

    const keyC = 'key_c'
    const request_key = 'request'

    class RequestTest {}
    class TestC {
      static inject = [request_key]

      constructor(public request: RequestTest) {}
    }

    pumpIt
      .bindClass(request_key, RequestTest, { scope: SCOPE.REQUEST })
      .bindClass(keyC, TestC)

    const instanceOne = pumpIt.resolve<TestC>(keyC)
    const instanceTwo = pumpIt.resolve<TestC>(keyC)

    expect(instanceOne.request).toBeInstanceOf(RequestTest)
    expect(instanceTwo.request).toBeInstanceOf(RequestTest)
    expect(instanceOne.request).not.toBe(instanceTwo.request)
  })
})
