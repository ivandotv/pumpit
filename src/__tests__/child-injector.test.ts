import { PumpIt } from '../pumpit'
import { get } from '../utils'

describe('Child injector', () => {
  test('Create child injector', () => {
    const parent = new PumpIt()
    const child = parent.child()

    expect(child).toBeInstanceOf(PumpIt)
    expect(child).not.toBe(parent)
    expect(child.getParent()).toBe(parent)
  })

  test('Child injector inherits parent values', () => {
    const parent = new PumpIt()
    const child = parent.child()
    const classKey = Symbol()
    const factoryKey = Symbol()
    const valueKey = Symbol()
    const factoryResult = 'hello'
    const factory = () => () => factoryResult
    const value = {}
    class TestA {}
    parent.bindClass(classKey, TestA)
    parent.bindFactory(factoryKey, factory)
    parent.bindValue(valueKey, value)

    const resolveClass = child.resolve(classKey)
    const resolveFactory = child.resolve<ReturnType<typeof factory>>(factoryKey)
    const resolveValue = child.resolve(valueKey)

    expect(resolveClass).toBeInstanceOf(TestA)
    expect(resolveFactory()).toBe(factoryResult)
    expect(resolveValue).toBe(value)
  })

  test('Child injector keys shadow parent keys', () => {
    const parent = new PumpIt()
    const child = parent.child()
    const classKey = Symbol()

    class ParentClass {}
    class ChildClass {}

    parent.bindClass(classKey, ParentClass)
    child.bindClass(classKey, ChildClass)

    const resolveClass = child.resolve(classKey)

    expect(resolveClass).toBeInstanceOf(ChildClass)
  })

  test('removing the value from child injector does not remove it from the parent', () => {
    const parent = new PumpIt()
    const child = parent.child()
    const classKey = Symbol()
    class ParentClass {}
    class ChildClass {}
    parent.bindClass(classKey, ParentClass)
    child.bindClass(classKey, ChildClass)

    child.unbind(classKey)

    expect(child.has(classKey, false)).toBe(false)
    expect(child.has(classKey, true)).toBe(true)
    expect(parent.has(classKey)).toBe(true)
  })

  test('if the value is not present at all, return false', () => {
    const parent = new PumpIt()
    const child = parent.child()

    expect(child.has('no_found', true)).toBe(false)
  })

  describe('Singletons', () => {
    describe('Shared', () => {
      test('when the key is on the parent, singleton is created on the parent', () => {
        const parent = new PumpIt()
        const child = parent.child({ shareSingletons: true })
        const key = Symbol('key')

        class TestA {
          static count = 0

          constructor() {
            TestA.count++
          }
        }
        parent.bindClass(key, TestA, { scope: 'SINGLETON' })

        const childInstance = child.resolve<TestA>(key)
        const parentInstance = parent.resolve<TestA>(key)

        expect(childInstance).toBe(parentInstance)
        expect(TestA.count).toBe(1)
      })

      test('when the key is on the child, singleton is created on the child', () => {
        const parent = new PumpIt()
        const child = parent.child({ shareSingletons: true })
        const key = Symbol('key')

        class TestA {
          static count = 0

          constructor() {
            TestA.count++
          }
        }
        parent.bindClass(key, TestA, { scope: 'SINGLETON' })
        child.bindClass(key, TestA, { scope: 'SINGLETON' })

        const childInstance = child.resolve<TestA>(key)
        const parentInstance = parent.resolve<TestA>(key)

        expect(childInstance).not.toBe(parentInstance)
        expect(TestA.count).toBe(2)
      })
    })
    describe('Not shared', () => {
      test('when the the key is on the parent, singleton is created on the child', () => {
        const parent = new PumpIt()
        const child = parent.child({ shareSingletons: false })
        const key = Symbol('key')

        class TestA {
          static count = 0

          constructor() {
            TestA.count++
          }
        }
        parent.bindClass(key, TestA, { scope: 'SINGLETON' })

        const childInstance = child.resolve<TestA>(key)
        const parentInstance = parent.resolve<TestA>(key)

        expect(childInstance).not.toBe(parentInstance)
        expect(TestA.count).toBe(2)
      })

      test('when the key is on the child, singleton is created on the child', () => {
        const parent = new PumpIt()
        const child = parent.child({ shareSingletons: false })
        const key = Symbol('key')

        class TestA {
          static count = 0

          constructor() {
            TestA.count++
          }
        }
        parent.bindClass(key, TestA, { scope: 'SINGLETON' })
        child.bindClass(key, TestA, { scope: 'SINGLETON' })

        const childInstance = child.resolve<TestA>(key)
        const parentInstance = parent.resolve<TestA>(key)

        expect(childInstance).not.toBe(parentInstance)
        expect(TestA.count).toBe(2)
      })

      describe('Inject from parent', () => {
        test('shared', () => {
          const parent = new PumpIt()
          const child = parent.child({ shareSingletons: true })
          const keyA = Symbol('keyA')
          const keyB = Symbol('keyB')

          class TestA {
            static count = 0

            constructor() {
              TestA.count++
            }
          }

          class TestB {
            static count = 0

            static inject = [keyA]

            constructor(public keyA: TestA) {
              TestB.count++
            }
          }

          parent.bindClass(keyA, TestA, { scope: 'SINGLETON' })
          child.bindClass(keyB, TestB, { scope: 'SINGLETON' })

          const childB = child.resolve<TestB>(keyB)
          const parentA = parent.resolve<TestA>(keyA)

          expect(TestA.count).toBe(1)
          expect(TestB.count).toBe(1)
          expect(childB.keyA).toBe(parentA)
        })

        test('not shared', () => {
          const parent = new PumpIt()
          const child = parent.child({ shareSingletons: false })
          const keyA = Symbol('keyA')
          const keyB = Symbol('keyB')

          class TestA {
            static count = 0

            constructor() {
              TestA.count++
            }
          }

          class TestB {
            static count = 0

            static inject = [keyA]

            constructor(public keyA: TestA) {
              TestB.count++
            }
          }
          parent.bindClass(keyA, TestA, { scope: 'SINGLETON' })
          child.bindClass(keyB, TestB, { scope: 'SINGLETON' })

          const childB = child.resolve<TestB>(keyB)
          child.resolve<TestB>(keyB)
          const parentA = parent.resolve<TestA>(keyA)
          parent.resolve<TestA>(keyA)

          expect(TestA.count).toBe(2)
          expect(TestB.count).toBe(1)
          expect(childB.keyA).not.toBe(parentA)
        })

        test('When not shared, child will create new singleton instance', () => {
          const parent = new PumpIt()
          const child = parent.child({ shareSingletons: false })

          class TestA {
            static count = 0

            constructor() {
              TestA.count++
            }
          }

          parent.bindClass(TestA, TestA, { scope: 'SINGLETON' })

          const parentInstance = parent.resolve<TestA>(TestA)
          const childInstance = child.resolve<TestA>(TestA)

          expect(TestA.count).toBe(2)
          expect(parentInstance).not.toBe(childInstance)
        })
      })

      describe('Circular injection', () => {
        test('shared', () => {
          const parent = new PumpIt()
          const child = parent.child({ shareSingletons: true })
          const keyA = Symbol('keyA')
          const keyB = Symbol('keyB')
          const keyC = Symbol('keyC')

          class TestA {
            static count = 0

            constructor() {
              TestA.count++
            }
          }

          class TestB {
            static count = 0

            static inject = [keyA, get(keyC, { lazy: true })]

            constructor(public keyA: TestA, public keyC: TestC) {
              TestB.count++
            }
          }

          class TestC {
            static count = 0

            static inject = [keyA, get(keyB, { lazy: true })]

            constructor(public keyA: TestA, public keyB: TestB) {
              TestC.count++
            }
          }

          parent.bindClass(keyA, TestA, { scope: 'SINGLETON' })
          child.bindClass(keyB, TestB, { scope: 'SINGLETON' })
          child.bindClass(keyC, TestC, { scope: 'SINGLETON' })

          const childB = child.resolve<TestB>(keyB)
          child.resolve<TestB>(keyB)
          child.resolve<TestC>(keyC)
          child.resolve<TestC>(keyC)
          const parentA = parent.resolve<TestA>(keyA)
          parent.resolve<TestA>(keyA)

          expect(TestA.count).toBe(1)
          expect(TestB.count).toBe(1)
          expect(TestC.count).toBe(1)
          expect(childB.keyA).toBe(parentA)
          expect(childB.keyC.keyA).toBe(parentA)
        })

        test('shared three levels', () => {
          const grandParent = new PumpIt()
          const parent = grandParent.child({ shareSingletons: true })
          const child = parent.child({ shareSingletons: true })
          const keyA = Symbol('keyA')
          const keyB = Symbol('keyB')
          const keyC = Symbol('keyC')

          class TestA {
            static count = 0

            constructor() {
              TestA.count++
            }
          }

          class TestB {
            static count = 0

            static inject = [keyA, get(keyC, { lazy: true })]

            constructor(public keyA: TestA, public keyC: TestC) {
              TestB.count++
            }
          }

          class TestC {
            static count = 0

            static inject = [keyA, get(keyB, { lazy: true })]

            constructor(public keyA: TestA, public keyB: TestB) {
              TestC.count++
            }
          }

          grandParent.bindClass(keyA, TestA, { scope: 'SINGLETON' })
          child.bindClass(keyB, TestB, { scope: 'SINGLETON' })
          child.bindClass(keyC, TestC, { scope: 'SINGLETON' })

          const childB = child.resolve<TestB>(keyB)
          child.resolve<TestB>(keyB)
          child.resolve<TestC>(keyC)
          child.resolve<TestC>(keyC)

          const parentA = parent.resolve<TestA>(keyA)
          parent.resolve<TestA>(keyA)

          grandParent.resolve<TestA>(keyA)

          expect(TestA.count).toBe(1)
          expect(TestB.count).toBe(1)
          expect(TestC.count).toBe(1)
          expect(childB.keyA).toBe(parentA)
          expect(childB.keyC.keyA).toBe(parentA)
        })

        test('not shared', () => {
          const parent = new PumpIt()
          const child = parent.child({ shareSingletons: false })
          const keyA = Symbol('keyA')
          const keyB = Symbol('keyB')
          const keyC = Symbol('keyC')

          class TestA {
            static count = 0

            constructor() {
              TestA.count++
            }
          }

          class TestB {
            static count = 0

            static inject = [keyA, get(keyC, { lazy: true })]

            constructor(public keyA: TestA, public keyC: TestC) {
              TestB.count++
            }
          }

          class TestC {
            static count = 0

            static inject = [keyA, get(keyB, { lazy: true })]

            constructor(public keyA: TestA, public keyB: TestB) {
              TestC.count++
            }
          }

          parent.bindClass(keyA, TestA, { scope: 'SINGLETON' })
          child.bindClass(keyB, TestB, { scope: 'SINGLETON' })
          child.bindClass(keyC, TestC)

          const childB = child.resolve<TestB>(keyB)
          const childC = child.resolve<TestC>(keyC)
          const childA = child.resolve<TestA>(keyA)
          child.resolve<TestB>(keyB)
          child.resolve<TestB>(keyB)
          const parentA = parent.resolve<TestA>(keyA)
          parent.resolve<TestA>(keyA)

          expect(TestA.count).toBe(2)
          expect(TestB.count).toBe(1)
          expect(TestC.count).toBe(2)

          expect(childB.keyA).not.toBe(parentA)
          expect(childB.keyA).toBe(childA)
          expect(childB.keyC.keyA).not.toBe(parentA)
          expect(childB.keyC.keyA).toBe(childB.keyA)

          expect(childC.keyB).toBe(childB)
          expect(childC.keyA).toBe(childA)
        })
      })
    })
  })
})
