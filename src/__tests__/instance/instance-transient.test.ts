import { Pumpa, SCOPE } from '../../pumpa'

describe('Class instance with "transient" scope', () => {
  test('Default scope is "transient"', () => {
    const pumpa = new Pumpa()
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

      constructor(public testA: TestA, public testACopy: TestA) {}
    }

    pumpa.addClass(key, TestA).addClass(keyB, TestB).addClass(keyC, TestC)

    const instance = pumpa.resolve<TestC>(keyC)

    expect(instance.testA).toBeInstanceOf(TestA)
    expect(instance.testACopy).toBeInstanceOf(TestA)
    expect(instance.testA).not.toBe(instance.testACopy)
  })

  test('Explicitly pass "transient" scope', () => {
    const pumpa = new Pumpa()
    const key = 'some_key'
    const keyB = 'key_c'

    class TestA {}
    class TestB {
      static inject = [key, key]

      constructor(public testA: TestA, public testACopy: TestA) {}
    }

    pumpa.addClass(key, TestA, { scope: SCOPE.TRANSIENT }).addClass(keyB, TestB)

    const instance = pumpa.resolve<TestB>(keyB)

    expect(instance.testA).toBeInstanceOf(TestA)
    expect(instance.testACopy).toBeInstanceOf(TestA)
    expect(instance.testA).not.toBe(instance.testACopy)
  })
})
