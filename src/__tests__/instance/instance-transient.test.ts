import { Pumpa, SCOPES } from '../../pumpa'

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

    pumpa.bindClass(key, TestA)
    pumpa.bindClass(keyB, TestB)
    pumpa.bindClass(keyC, TestC)

    const instance = pumpa.resolve<TestC>(keyC)

    expect(instance.testA).toBeInstanceOf(TestA)
    expect(instance.testACopy).toBeInstanceOf(TestA)

    expect(instance.testA).not.toBe(instance.testACopy)
  })
  test('Explicitly pass scope', () => {
    const pumpa = new Pumpa()
    const key = 'some_key'
    const keyB = 'key_c'

    class TestA {}

    class TestB {
      static inject = [key, key]

      constructor(public testA: TestA, public testACopy: TestA) {}
    }

    pumpa.bindClass(key, TestA, { scope: SCOPES.TRANSIENT })
    pumpa.bindClass(keyB, TestB)

    const instance = pumpa.resolve<TestB>(keyB)

    expect(instance.testA).toBeInstanceOf(TestA)
    expect(instance.testACopy).toBeInstanceOf(TestA)

    expect(instance.testA).not.toBe(instance.testACopy)
  })
})
