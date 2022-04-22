import { Pumpa, SCOPES } from '../../pumpa'

// console.log(TestA) //TODO  better errors when resolving failes
describe('class instance with "request" scope', () => {
  test('"request" returns the same instance for a single resolve', () => {
    const pumpa = new Pumpa()

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

    pumpa.addClass(request_key, RequestTest, { scope: SCOPES.REQUEST })
    pumpa.addClass(keyA, TestA)
    pumpa.addClass(keyB, TestB)
    pumpa.addClass(keyC, TestC)

    const instanceC = pumpa.resolve<TestC>(keyC)

    expect(instanceC.keyB).toBeInstanceOf(TestB)
    expect(instanceC.keyA).toBeInstanceOf(TestA)
    expect(instanceC.request).toBeInstanceOf(RequestTest)

    expect(instanceC.request).toBe(instanceC.keyA.request)
    expect(instanceC.request).toBe(instanceC.keyB.request)
    expect(instanceC.keyA.request).toBe(instanceC.keyB.request)
  })

  test('Multiple resolve calls return different instances', () => {
    const pumpa = new Pumpa()
    const key = 'some_key'

    class TestA {}

    pumpa.addClass(key, TestA, { scope: SCOPES.REQUEST })

    const instanceA = pumpa.resolve(key)
    const instanceB = pumpa.resolve(key)

    expect(instanceA).toBeInstanceOf(TestA)
    expect(instanceA).not.toBe(instanceB)
  })

  test('Multiple resolve calls return different injected instance', () => {
    const pumpa = new Pumpa()

    const keyC = 'key_c'
    const request_key = 'request'

    class RequestTest {}

    class TestC {
      static inject = [request_key]

      constructor(public request: RequestTest) {}
    }

    pumpa.addClass(request_key, RequestTest, { scope: SCOPES.REQUEST })
    pumpa.addClass(keyC, TestC)

    const instanceOne = pumpa.resolve<TestC>(keyC)
    const instanceTwo = pumpa.resolve<TestC>(keyC)

    expect(instanceOne.request).toBeInstanceOf(RequestTest)
    expect(instanceTwo.request).toBeInstanceOf(RequestTest)

    expect(instanceOne.request).not.toBe(instanceTwo.request)
  })
})
