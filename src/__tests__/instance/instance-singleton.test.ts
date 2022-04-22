import { Pumpa, SCOPES } from '../../pumpa'

// console.log(TestA) //TODO  better errors when resolving failes
describe('Register singleton', () => {
  test('Can register singleton', () => {
    const pumpa = new Pumpa()
    const key = 'some_key'

    class TestA {}

    pumpa.addClass(key, TestA, { scope: SCOPES.SINGLETON })

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

    pumpa.addClass(key, TestA, { scope: SCOPES.SINGLETON })
    pumpa.addClass(keyB, TestB)
    pumpa.addClass(keyC, TestC)

    const instanceOne = pumpa.resolve<TestA>(key)
    const instanceTwo = pumpa.resolve<TestA>(key)

    expect(instanceOne).toBeInstanceOf(TestA)
    expect(instanceOne).toBe(instanceTwo)

    expect(instanceOne.keyB).toBeInstanceOf(TestB)
    expect(instanceOne.keyC).toBeInstanceOf(TestC)
  })

  test('Singleton dependencies are also cached', () => {
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

    pumpa.addClass(key, TestA, { scope: SCOPES.SINGLETON })
    pumpa.addClass(keyB, TestB)
    pumpa.addClass(keyC, TestC)

    const instanceOne = pumpa.resolve<TestA>(key)
    const instanceTwo = pumpa.resolve<TestA>(key)

    expect(instanceOne.keyB).toBeInstanceOf(TestB)
    expect(instanceOne.keyC).toBeInstanceOf(TestC)

    expect(instanceOne.keyB).toBe(instanceTwo.keyB)
    expect(instanceOne.keyC).toBe(instanceTwo.keyC)
  })
})
