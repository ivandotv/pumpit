import { Pumpa } from '../pumpa'

describe('Circular dependency', () => {
  test('Throw when circular reference is detected', () => {
    const pumpa = new Pumpa()
    const keyA = 'key_a'
    const keyB = Symbol('key_b')
    const keyC = 'key_c'
    const keyD = 'key_d'

    class TestA {
      static inject = [keyB]
    }
    class TestB {
      static inject = [keyC]
    }
    class TestC {
      static inject = [keyD]
    }

    function factory() {
      return () => {
        return 'hello'
      }
    }

    factory.inject = [keyA]

    pumpa
      .addClass(keyA, TestA)
      .addClass(keyB, TestB)
      .addClass(keyC, TestC)
      .addFactory(keyD, factory)

    // pumpa.resolve<TestA>(keyA)
    expect(() => pumpa.resolve<TestA>(keyA)).toThrowError(
      'Circular reference detected'
    )
    // expect(true).toBe(true)
  })

  test('Do not throw if reference is of type "value"', () => {
    const pumpa = new Pumpa()
    const keyA = 'key_a'
    const keyB = Symbol('key_b')
    const keyC = 'key_c'
    const keyD = 'key_d'

    class TestA {
      static inject = [keyB, keyD]
    }
    class TestB {
      static inject = [keyD, keyC]
    }
    class TestC {
      static inject = [keyD]
    }

    const data = { name: 'foo' }

    pumpa
      .addClass(keyA, TestA)
      .addClass(keyB, TestB)
      .addClass(keyC, TestC)
      .addValue(keyD, data)

    expect(() => pumpa.resolve<TestA>(keyA)).not.toThrowError()
  })
})
