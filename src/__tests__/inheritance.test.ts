import { describe, expect, test } from 'vitest'
import { PumpIt } from '../pumpit'

describe('Class Inheritance', () => {
  test('child class inherits parent injection parameters ', () => {
    const pumpIt = new PumpIt()

    class TestB {}

    class TestA {
      static inject = [TestB]
    }

    class TestC extends TestA {
      constructor(public b: TestB) {
        super()
      }
    }

    pumpIt.bindClass(TestA, TestA)
    pumpIt.bindClass(TestB, TestB)
    pumpIt.bindClass(TestC, TestC)

    const instance = pumpIt.resolve<TestC>(TestC)

    expect(instance.b).toBeInstanceOf(TestB)
  })

  test('child class combines injection parameters from the parent', () => {
    const pumpIt = new PumpIt()

    class TestB {}
    class TestD {}

    class TestA {
      static inject = [TestB]
    }

    class TestC extends TestA {
      static inject = [...TestA.inject, TestD]

      constructor(
        public b: TestB,
        public d: TestD
      ) {
        super()
      }
    }

    pumpIt.bindClass(TestA, TestA)
    pumpIt.bindClass(TestB, TestB)
    pumpIt.bindClass(TestC, TestC)
    pumpIt.bindClass(TestD, TestD)

    const instance = pumpIt.resolve<TestC>(TestC)

    expect(instance.b).toBeInstanceOf(TestB)
    expect(instance.d).toBeInstanceOf(TestD)
  })
})
