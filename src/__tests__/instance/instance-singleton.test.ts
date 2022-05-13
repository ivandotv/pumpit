import { PumpIt, SCOPE } from '../../pumpit'

describe('Class with scope: singleton', () => {
  test('same class instance is always returned', () => {
    const pumpIt = new PumpIt()
    const key = 'some_key'
    class TestA {}

    pumpIt.bindClass(key, TestA, { scope: SCOPE.SINGLETON })

    const instanceA = pumpIt.resolve(key)
    const instanceB = pumpIt.resolve(key)

    expect(instanceA).toBeInstanceOf(TestA)
    expect(instanceA).toBe(instanceB)
  })

  test('can register singleton with dependencies', () => {
    const pumpIt = new PumpIt()
    const key = 'some_key'
    const keyB = 'key_b'
    const keyC = 'key_c'

    class TestA {
      static inject = [keyB, keyC]

      constructor(public keyB: TestB, public keyC: TestC) {}
    }
    class TestB {}
    class TestC {}

    pumpIt
      .bindClass(key, TestA, { scope: SCOPE.SINGLETON })
      .bindClass(keyB, TestB)
      .bindClass(keyC, TestC)

    const instanceOne = pumpIt.resolve<TestA>(key)
    const instanceTwo = pumpIt.resolve<TestA>(key)

    expect(instanceOne).toBeInstanceOf(TestA)
    expect(instanceOne).toBe(instanceTwo)
    expect(instanceOne.keyB).toBeInstanceOf(TestB)
    expect(instanceOne.keyC).toBeInstanceOf(TestC)
  })

  test('singleton dependencies are cached', () => {
    const pumpIt = new PumpIt()
    const key = 'some_key'
    const keyB = 'key_b'
    const keyC = 'key_c'

    class TestA {
      static inject = [keyB, keyC]

      constructor(public keyB: TestB, public keyC: TestC) {}
    }
    class TestB {}
    class TestC {}

    pumpIt
      .bindClass(key, TestA, { scope: SCOPE.SINGLETON })
      .bindClass(keyB, TestB)
      .bindClass(keyC, TestC)

    const instanceOne = pumpIt.resolve<TestA>(key)
    const instanceTwo = pumpIt.resolve<TestA>(key)

    expect(instanceOne.keyB).toBeInstanceOf(TestB)
    expect(instanceOne.keyC).toBeInstanceOf(TestC)

    expect(instanceOne.keyB).toBe(instanceTwo.keyB)
    expect(instanceOne.keyC).toBe(instanceTwo.keyC)
  })
})
