import { Pumpa, SCOPE } from '../../pumpa'

describe('Class singleton', () => {
  test('Same class instance is always returned', () => {
    const pumpa = new Pumpa()
    const key = 'some_key'
    class TestA {}

    pumpa.bindClass(key, TestA, { scope: SCOPE.SINGLETON })

    const instanceA = pumpa.resolve(key)
    const instanceB = pumpa.resolve(key)

    expect(instanceA).toBeInstanceOf(TestA)
    expect(instanceA).toBe(instanceB)
  })

  test('Can register singleton with dependencies', () => {
    const pumpa = new Pumpa()
    const key = 'some_key'
    const keyB = 'key_b'
    const keyC = 'key_c'

    class TestA {
      static inject = [keyB, keyC]

      constructor(public keyB: TestB, public keyC: TestC) {}
    }
    class TestB {}
    class TestC {}

    pumpa
      .bindClass(key, TestA, { scope: SCOPE.SINGLETON })
      .bindClass(keyB, TestB)
      .bindClass(keyC, TestC)

    const instanceOne = pumpa.resolve<TestA>(key)
    const instanceTwo = pumpa.resolve<TestA>(key)

    expect(instanceOne).toBeInstanceOf(TestA)
    expect(instanceOne).toBe(instanceTwo)
    expect(instanceOne.keyB).toBeInstanceOf(TestB)
    expect(instanceOne.keyC).toBeInstanceOf(TestC)
  })

  test('Singleton dependencies are cached', () => {
    const pumpa = new Pumpa()
    const key = 'some_key'
    const keyB = 'key_b'
    const keyC = 'key_c'

    class TestA {
      static inject = [keyB, keyC]

      constructor(public keyB: TestB, public keyC: TestC) {}
    }
    class TestB {}
    class TestC {}

    pumpa
      .bindClass(key, TestA, { scope: SCOPE.SINGLETON })
      .bindClass(keyB, TestB)
      .bindClass(keyC, TestC)

    const instanceOne = pumpa.resolve<TestA>(key)
    const instanceTwo = pumpa.resolve<TestA>(key)

    expect(instanceOne.keyB).toBeInstanceOf(TestB)
    expect(instanceOne.keyC).toBeInstanceOf(TestC)

    expect(instanceOne.keyB).toBe(instanceTwo.keyB)
    expect(instanceOne.keyC).toBe(instanceTwo.keyC)
  })
})
