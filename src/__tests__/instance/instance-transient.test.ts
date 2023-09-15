import { PumpIt, SCOPE } from '../../pumpit'

describe('Class with scope: transient', () => {
  test('default scope is "transient"', () => {
    const pumpIt = new PumpIt()
    const key = 'some_key'
    const keyB = 'key_b'
    const keyC = 'key_c'

    class TestA {}
    class TestB {
      static inject = [key]

      constructor(public testA: TestA) {}
    }
    class TestC {
      static inject = [key, key]

      constructor(
        public testA: TestA,
        public testACopy: TestA
      ) {}
    }

    pumpIt.bindClass(key, TestA).bindClass(keyB, TestB).bindClass(keyC, TestC)

    const instance = pumpIt.resolve<TestC>(keyC)

    expect(instance.testA).toBeInstanceOf(TestA)
    expect(instance.testACopy).toBeInstanceOf(TestA)
    expect(instance.testA).not.toBe(instance.testACopy)
  })

  test('explicitly pass "transient" scope', () => {
    const pumpIt = new PumpIt()
    const key = 'some_key'
    const keyB = 'key_c'

    class TestA {}
    class TestB {
      static inject = [key, key]

      constructor(
        public testA: TestA,
        public testACopy: TestA
      ) {}
    }

    pumpIt
      .bindClass(key, TestA, { scope: SCOPE.TRANSIENT })
      .bindClass(keyB, TestB)

    const instance = pumpIt.resolve<TestB>(keyB)

    expect(instance.testA).toBeInstanceOf(TestA)
    expect(instance.testACopy).toBeInstanceOf(TestA)
    expect(instance.testA).not.toBe(instance.testACopy)
  })
})
