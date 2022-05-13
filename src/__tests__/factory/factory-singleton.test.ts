import { PumpIt, SCOPE } from '../../pumpit'

describe('Factory with scope: singleton', () => {
  test('same factory reference is always returned', () => {
    const pumpIt = new PumpIt()
    const key = 'some_key'

    let count = 0

    type Fn = ReturnType<typeof factory>
    function factory() {
      count++

      return () => {
        return count
      }
    }

    pumpIt.bindFactory(key, factory, { scope: SCOPE.SINGLETON })

    const instanceA = pumpIt.resolve<Fn>(key)
    const instanceB = pumpIt.resolve<Fn>(key)

    expect(count).toBe(1)

    expect(instanceA).toBe(instanceB)
  })

  test('can register singleton with dependencies', () => {
    const pumpIt = new PumpIt()
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

    pumpIt
      .bindFactory(key, factory, { scope: SCOPE.SINGLETON })
      .bindClass(keyB, TestB)
      .bindClass(keyC, TestC)

    const fnOne = pumpIt.resolve<Fn>(key)
    const fnTwo = pumpIt.resolve<Fn>(key)

    expect(fnOne).toBe(fnTwo)
    expect(fnOne().keyB).toBeInstanceOf(TestB)
    expect(fnOne().keyC).toBeInstanceOf(TestC)
    expect(fnTwo().keyB).toBe(fnOne().keyB)
    expect(fnTwo().keyC).toBe(fnOne().keyC)
    expect(count).toBe(1)
  })
})
