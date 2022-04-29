import { Pumpa, SCOPE } from '../../pumpa'

describe('Singleton factory', () => {
  test('Same factory is always returned', () => {
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

    pumpa.addFactory(key, factory, { scope: SCOPE.SINGLETON })

    const instanceA = pumpa.resolve<Fn>(key)
    const instanceB = pumpa.resolve<Fn>(key)

    expect(count).toBe(1)

    expect(instanceA).toBe(instanceB)
  })

  test('Can register singleton with dependencies', () => {
    const pumpa = new Pumpa()
    const key = 'some_key'
    const keyB = 'key_b'
    const keyC = 'key_c'
    class TestB {}
    class TestC {}

    let count = 0

    type Fn = ReturnType<typeof factory>
    function factory(keyB: TestB, keyC: TestC) {
      count++

      return () => {
        return {
          keyB,
          keyC,
          count
        }
      }
    }
    factory.inject = [keyB, keyC]

    pumpa
      .addFactory(key, factory, { scope: SCOPE.SINGLETON })
      .addClass(keyB, TestB)
      .addClass(keyC, TestC)

    const fnOne = pumpa.resolve<Fn>(key)
    const fnTwo = pumpa.resolve<Fn>(key)

    expect(fnOne).toBe(fnTwo)
    expect(fnOne().keyB).toBeInstanceOf(TestB)
    expect(fnOne().keyC).toBeInstanceOf(TestC)
    expect(fnTwo().keyB).toBe(fnOne().keyB)
    expect(fnTwo().keyC).toBe(fnOne().keyC)
    expect(count).toBe(1)
  })
})
