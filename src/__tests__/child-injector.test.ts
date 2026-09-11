import { describe, expect, test, vi } from "vitest"
import { PumpIt, SCOPE } from "../pumpit"

describe("Child container", () => {
  test("create child container", () => {
    const parent = new PumpIt()
    const child = parent.child()

    expect(child).toBeInstanceOf(PumpIt)
    expect(child).not.toBe(parent)
    expect(child.getParent()).toBe(parent)
  })

  test("child container can set it's own parent", () => {
    const parent = new PumpIt()
    const child = new PumpIt()

    child.setParent(parent)

    expect(child.getParent()).toBe(parent)
  })

  test("child container inherits parent values", () => {
    const parent = new PumpIt()
    const child = parent.child()
    const classKey = Symbol()
    const factoryKey = Symbol()
    const valueKey = Symbol()
    const factoryResult = "hello"
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

  test("child container keys shadow parent keys", () => {
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

  test("removing the value from child container does not remove it from the parent", () => {
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
    expect(parent.resolve(classKey)).toBeInstanceOf(ParentClass)
  })

  test("if the value is not present at all, return false", () => {
    const parent = new PumpIt()
    const child = parent.child()

    expect(child.has("no_found", true)).toBe(false)
  })

  describe("Singletons", () => {
    test("when the key is on the parent, singleton is created on the parent", () => {
      const parent = new PumpIt()
      const child = parent.child()
      const key = Symbol("key")

      class TestA {
        static count = 0

        constructor() {
          TestA.count++
        }
      }
      parent.bindClass(key, TestA, { scope: "SINGLETON" })

      const childInstance = child.resolve<TestA>(key)
      const parentInstance = parent.resolve<TestA>(key)

      expect(childInstance).toBe(parentInstance)
      expect(TestA.count).toBe(1)
    })

    test("when the key is on the child, singleton is created on the child", () => {
      const parent = new PumpIt()
      const child = parent.child()
      const key = Symbol("key")

      class TestA {
        static count = 0

        constructor() {
          TestA.count++
        }
      }
      parent.bindClass(key, TestA, { scope: "SINGLETON" })
      child.bindClass(key, TestA, { scope: "SINGLETON" })

      const childInstance = child.resolve<TestA>(key)
      const parentInstance = parent.resolve<TestA>(key)

      expect(childInstance).not.toBe(parentInstance)
      expect(TestA.count).toBe(2)
    })

    test("dependency is picked up from child", () => {
      const parentContainer = new PumpIt()
      const childContainer = parentContainer.child()
      const parentConfig = { name: "Ivan" }
      const childConfig = { name: "Leonardo" }

      class TestA {
        static inject = ["config"]

        constructor(public config: any) {}
      }

      parentContainer.bindClass(TestA, TestA)
      parentContainer.bindValue("config", parentConfig)
      childContainer.bindValue("config", childConfig)

      const instance = childContainer.resolve<TestA>(TestA)

      expect(instance.config).toBe(childConfig)
    })

    describe("Container scoped (CONTAINER_SINGLETON)", () => {
      test("when the the key is on the parent, singleton is created on the child", () => {
        const parent = new PumpIt()
        const child = parent.child()
        const key = Symbol("key")

        class TestA {
          static count = 0

          constructor() {
            TestA.count++
          }
        }
        parent.bindClass(key, TestA, { scope: SCOPE.CONTAINER_SINGLETON })

        const childInstance = child.resolve<TestA>(key)
        const parentInstance = parent.resolve<TestA>(key)
        const childInstanceTwo = child.resolve<TestA>(key)

        expect(childInstance).not.toBe(parentInstance)
        expect(childInstance).toBe(childInstanceTwo)
        expect(TestA.count).toBe(2)
      })

      test("when the dependency is created on the parent, child will still create a new singleton instance", () => {
        const parent = new PumpIt()
        const child = parent.child()

        class TestA {
          static count = 0

          constructor() {
            TestA.count++
          }
        }

        parent.bindClass(TestA, TestA, { scope: SCOPE.CONTAINER_SINGLETON })

        const parentInstance = parent.resolve<TestA>(TestA)
        const childInstance = child.resolve<TestA>(TestA)
        const childInstanceTwo = child.resolve<TestA>(TestA)

        expect(TestA.count).toBe(2)
        expect(parentInstance).not.toBe(childInstance)
        expect(childInstanceTwo).toBe(childInstance)
      })

      test("parent value resolves with child dependency", () => {
        const parentContainer = new PumpIt()
        const childContainer = parentContainer.child()
        const parentConfig = { name: "Ivan" }
        const childConfig = { name: "Leonardo" }

        class TestB {
          static inject = ["config"]

          constructor(public config: any) {}
        }

        class TestA {
          static inject = [TestB]

          constructor(public config: TestB) {}
        }

        class TestBShadow {
          static inject = ["config"]
        }

        parentContainer.bindClass(TestA, TestA)
        parentContainer.bindClass(TestB, TestB)
        parentContainer.bindValue("config", parentConfig)

        childContainer.bindValue("config", childConfig)
        childContainer.bindClass(TestB, TestBShadow, {
          scope: SCOPE.CONTAINER_SINGLETON,
        })

        const instance = childContainer.resolve<TestA>(TestA)

        expect(instance.config).toBeInstanceOf(TestBShadow)
      })

      test("dependency is picked up from parent", () => {
        const parentContainer = new PumpIt()
        const childContainer = parentContainer.child()
        const parentConfig = { name: "Ivan" }
        const childConfig = { name: "Leonardo" }

        class TestA {
          static inject = ["config"]

          constructor(public config: any) {}
        }

        parentContainer.bindClass(TestA, TestA, {
          scope: SCOPE.CONTAINER_SINGLETON,
        })
        parentContainer.bindValue("config", parentConfig)
        childContainer.bindValue("config", childConfig)

        const instance = childContainer.resolve<TestA>(TestA)

        expect(instance.config).toBe(childConfig)
      })

      test("shadowing a resolved parent binding replaces the child-owned instance", () => {
        const parent = new PumpIt()
        const child = parent.child()
        const dispose = vi.fn()

        class ParentService {
          dispose() {
            dispose()
          }
        }
        class ChildService {}

        parent.bindClass("service", ParentService, {
          scope: SCOPE.CONTAINER_SINGLETON,
        })

        expect(child.resolve("service")).toBeInstanceOf(ParentService)

        child.bindClass("service", ChildService, { scope: SCOPE.SINGLETON })

        expect(dispose).toHaveBeenCalledTimes(1)
        expect(child.resolve("service")).toBeInstanceOf(ChildService)
      })

      test("changing parent disposes inherited instances but preserves local singletons", () => {
        const firstParent = new PumpIt()
        const secondParent = new PumpIt()
        const child = firstParent.child()
        const inheritedDispose = vi.fn()

        class FirstService {
          dispose() {
            inheritedDispose()
          }
        }
        class SecondService {}
        class LocalService {}

        firstParent.bindClass("service", FirstService, {
          scope: SCOPE.CONTAINER_SINGLETON,
        })
        secondParent.bindClass("service", SecondService, {
          scope: SCOPE.CONTAINER_SINGLETON,
        })
        child.bindClass("local", LocalService, { scope: SCOPE.SINGLETON })

        const inherited = child.resolve("service")
        const local = child.resolve("local")

        child.setParent(secondParent)

        expect(inheritedDispose).toHaveBeenCalledTimes(1)
        expect(child.resolve("service")).toBeInstanceOf(SecondService)
        expect(child.resolve("service")).not.toBe(inherited)
        expect(child.resolve("local")).toBe(local)
      })

      test("setting the same parent preserves child-owned instances", () => {
        const parent = new PumpIt()
        const child = parent.child()

        class Service {}

        parent.bindClass("service", Service, {
          scope: SCOPE.CONTAINER_SINGLETON,
        })
        const instance = child.resolve("service")

        child.setParent(parent)

        expect(child.resolve("service")).toBe(instance)
      })

      test("replacing a parent binding invalidates a child-owned instance on next resolve", () => {
        const parent = new PumpIt()
        const child = parent.child()
        const dispose = vi.fn()

        class OldService {
          dispose() {
            dispose()
          }
        }
        class NewService {}

        parent.bindClass("service", OldService, {
          scope: SCOPE.CONTAINER_SINGLETON,
        })
        const oldInstance = child.resolve("service")

        parent.bindClass("service", NewService, {
          scope: SCOPE.CONTAINER_SINGLETON,
          replace: true,
        })

        const newInstance = child.resolve("service")
        expect(dispose).toHaveBeenCalledTimes(1)
        expect(newInstance).toBeInstanceOf(NewService)
        expect(newInstance).not.toBe(oldInstance)
      })

      test("replacing an inherited binding with a value disposes the child-owned instance", () => {
        const parent = new PumpIt()
        const child = parent.child()
        const dispose = vi.fn()

        class Service {
          dispose() {
            dispose()
          }
        }

        parent.bindClass("service", Service, {
          scope: SCOPE.CONTAINER_SINGLETON,
        })
        child.resolve("service")

        parent.bindValue("service", "replacement", { replace: true })

        expect(child.resolve("service")).toBe("replacement")
        expect(dispose).toHaveBeenCalledTimes(1)
      })

      test("removing an inherited binding disposes the child-owned instance on next lookup", () => {
        const parent = new PumpIt()
        const child = parent.child()
        const dispose = vi.fn()

        class Service {
          dispose() {
            dispose()
          }
        }

        parent.bindClass("service", Service, {
          scope: SCOPE.CONTAINER_SINGLETON,
        })
        child.resolve("service")

        parent.unbind("service")

        expect(child.tryResolve("service")).toBeUndefined()
        expect(dispose).toHaveBeenCalledTimes(1)
      })

      test("disposing a child disposes instances created from inherited bindings", () => {
        const parent = new PumpIt()
        const child = parent.child()
        const dispose = vi.fn()

        class Service {
          dispose() {
            dispose()
          }
        }

        parent.bindClass("service", Service, {
          scope: SCOPE.CONTAINER_SINGLETON,
        })
        const first = child.resolve("service")

        child[Symbol.dispose]()

        expect(dispose).toHaveBeenCalledTimes(1)
        expect(child.resolve("service")).not.toBe(first)
      })
    })

    describe("Resolve dependency from the parent", () => {
      test("singleton", () => {
        const parent = new PumpIt()
        const child = parent.child()
        const keyA = Symbol("keyA")
        const keyB = Symbol("keyB")

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

        parent.bindClass(keyA, TestA, { scope: "SINGLETON" })
        child.bindClass(keyB, TestB, { scope: "SINGLETON" })

        const childB = child.resolve<TestB>(keyB)
        const parentA = parent.resolve<TestA>(keyA)

        expect(TestA.count).toBe(1)
        expect(TestB.count).toBe(1)
        expect(childB.keyA).toBe(parentA)
      })

      test("container scoped singleton", () => {
        const parent = new PumpIt()
        const child = parent.child()
        const keyA = Symbol("keyA")
        const keyB = Symbol("keyB")

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

        parent.bindClass(keyA, TestA, { scope: SCOPE.CONTAINER_SINGLETON })
        child.bindClass(keyB, TestB, { scope: "SINGLETON" })

        const childB = child.resolve<TestB>(keyB)
        //second resolve
        child.resolve<TestB>(keyB)

        const parentA = parent.resolve<TestA>(keyA)
        parent.resolve<TestA>(keyA)

        expect(TestA.count).toBe(2)
        expect(TestB.count).toBe(1)
        expect(childB.keyA).not.toBe(parentA)
      })
    })
  })
})
