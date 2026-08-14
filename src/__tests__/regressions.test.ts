import { describe, expect, test, vi } from "vitest"
import { PumpIt, SCOPE } from "../pumpit"
import { ERROR_CODE, type PumpitError } from "../pumpit-error"
import { get } from "../utils"

describe("Regressions", () => {
  describe("bindings that resolve to undefined", () => {
    test("singleton returns undefined on the first resolve, not an internal sentinel", () => {
      const pumpIt = new PumpIt()

      pumpIt.bindFactory("key", () => undefined, { scope: SCOPE.SINGLETON })

      expect(pumpIt.resolve("key")).toBeUndefined()
      expect(pumpIt.resolve("key")).toBeUndefined()
    })

    test("request scope returns undefined on the first resolve", () => {
      const pumpIt = new PumpIt()

      pumpIt.bindFactory("key", () => undefined, { scope: SCOPE.REQUEST })

      expect(pumpIt.resolve("key")).toBeUndefined()
    })

    test("the factory only runs once even though it produced undefined", () => {
      const pumpIt = new PumpIt()
      const factory = vi.fn(() => undefined)

      pumpIt.bindFactory("key", factory, { scope: SCOPE.SINGLETON })

      pumpIt.resolve("key")
      pumpIt.resolve("key")

      expect(factory).toHaveBeenCalledTimes(1)
    })

    test("an undefined singleton is injected as undefined", () => {
      const pumpIt = new PumpIt()

      class TestA {
        static inject = ["undefined_key"]

        constructor(public dep: unknown) {}
      }

      pumpIt.bindFactory("undefined_key", () => undefined, {
        scope: SCOPE.SINGLETON,
      })
      pumpIt.bindClass(TestA, TestA)

      // first resolve populates the singleton cache, second one reads it back
      expect(pumpIt.resolve<TestA>(TestA).dep).toBeUndefined()
      expect(pumpIt.resolve<TestA>(TestA).dep).toBeUndefined()
    })
  })

  describe("validation", () => {
    test("reports a missing dependency regardless of bind order", () => {
      const pumpIt = new PumpIt()
      const missing = Symbol("missing")

      class TestA {
        static inject = [missing]
      }
      class TestB {
        static inject = [TestA]
      }

      // TestA is seen as a dependency of TestB before its own pool entry is
      // reached, which used to abort the whole validation
      pumpIt.bindClass(TestB, TestB).bindClass(TestA, TestA)

      expect(pumpIt.validateSafe()).toEqual({
        valid: false,
        errors: [{ key: missing, wantedBy: [TestA] }],
      })
      expect(() => pumpIt.validate()).toThrow("Validation failed")
    })

    test("validateSafe always returns a result", () => {
      const pumpIt = new PumpIt()

      class TestA {}
      class TestB {
        static inject = [TestA]
      }
      pumpIt.bindClass(TestA, TestA).bindClass(TestB, TestB)

      expect(pumpIt.validateSafe()).toEqual({ valid: true, errors: [] })
    })

    test("a chain of dependencies is fully walked", () => {
      const pumpIt = new PumpIt()

      class TestA {
        static inject = ["missing_a"]
      }
      class TestB {
        static inject = [TestA, "missing_b"]
      }
      class TestC {
        static inject = [TestB]
      }

      pumpIt
        .bindClass(TestC, TestC)
        .bindClass(TestB, TestB)
        .bindClass(TestA, TestA)

      const result = pumpIt.validateSafe()

      expect(result.valid).toBe(false)
      expect(result.errors).toEqual([
        { key: "missing_b", wantedBy: [TestB] },
        { key: "missing_a", wantedBy: [TestA] },
      ])
    })

    test("a missing optional dependency is not a validation error", () => {
      const pumpIt = new PumpIt()

      class TestA {
        static inject = [get("nope", { optional: true })]
      }

      pumpIt.bindClass(TestA, TestA)

      expect(pumpIt.validateSafe()).toEqual({ valid: true, errors: [] })
      expect(() => pumpIt.validate()).not.toThrow()
    })

    test("a missing required dependency is still an error next to an optional one", () => {
      const pumpIt = new PumpIt()

      class TestA {
        static inject = [get("nope", { optional: true }), "required_key"]
      }

      pumpIt.bindClass(TestA, TestA)

      expect(pumpIt.validateSafe()).toEqual({
        valid: false,
        errors: [{ key: "required_key", wantedBy: [TestA] }],
      })
    })

    test("validation looks into the parent container", () => {
      const parent = new PumpIt()
      const child = parent.child()

      class Dep {}
      class TestA {
        static inject = [Dep]
      }

      parent.bindClass(Dep, Dep)
      child.bindClass(TestA, TestA)

      expect(child.validateSafe()).toEqual({ valid: true, errors: [] })
    })
  })

  describe("resolving across containers keeps one request context", () => {
    test("request scope is shared with a parent owned singleton", () => {
      const parent = new PumpIt()
      const child = parent.child()

      class Req {}
      class OnParent {
        static inject = ["req"]

        constructor(public req: Req) {}
      }
      class OnChild {
        static inject = ["req", "on_parent"]

        constructor(
          public req: Req,
          public onParent: OnParent,
        ) {}
      }

      parent.bindClass("req", Req, { scope: SCOPE.REQUEST })
      parent.bindClass("on_parent", OnParent, { scope: SCOPE.SINGLETON })
      child.bindClass("on_child", OnChild)

      const result = child.resolve<OnChild>("on_child")

      expect(result.req).toBe(result.onParent.req)
    })

    test("post construct runs after the whole graph is built", () => {
      const order: string[] = []
      const parent = new PumpIt()
      const child = parent.child()

      class Dep {
        postConstruct() {
          order.push("dep.postConstruct")
        }
      }
      class Root {
        static inject = ["dep"]

        constructor(public dep: Dep) {
          order.push("root.constructor")
        }

        postConstruct() {
          order.push("root.postConstruct")
        }
      }

      parent.bindClass("dep", Dep, { scope: SCOPE.SINGLETON })
      child.bindClass("root", Root)

      child.resolve("root")

      expect(order).toEqual([
        "root.constructor",
        "dep.postConstruct",
        "root.postConstruct",
      ])
    })

    test("a circular reference across containers is detected", () => {
      const parent = new PumpIt()
      const child = parent.child()

      class TestA {
        static inject = ["b"]
      }
      class TestB {
        static inject = ["a"]
      }

      parent.bindClass("a", TestA, { scope: SCOPE.SINGLETON })
      parent.bindClass("b", TestB, { scope: SCOPE.SINGLETON })

      expect(() => child.resolve("a")).toThrow("Circular reference detected")
    })

    test("the singleton still lands on the container that owns the key", () => {
      const parent = new PumpIt()
      const child = parent.child()

      class TestA {}
      parent.bindClass("a", TestA, { scope: SCOPE.SINGLETON })

      expect(child.resolve("a")).toBe(parent.resolve("a"))
    })
  })

  describe("circular reference reporting", () => {
    test("the message shows the full path with bound class names", () => {
      const pumpIt = new PumpIt()

      class TestA {
        static inject = ["b"]
      }
      class TestB {
        static inject = ["c"]
      }
      class TestC {
        static inject = ["a"]
      }

      pumpIt.bindClass("a", TestA).bindClass("b", TestB).bindClass("c", TestC)

      try {
        pumpIt.resolve("a")
      } catch (e) {
        expect((e as Error).message).toBe(
          "Circular reference detected: [ a: TestA ] -> [ b: TestB ] -> [ c: TestC ] -> [ a: TestA ]",
        )
        expect((e as PumpitError).code).toBe(ERROR_CODE.CIRCULAR_REFERENCE)
      }

      expect.assertions(2)
    })

    test("a diamond shaped graph is not reported as circular", () => {
      const pumpIt = new PumpIt()

      class Leaf {}
      class Left {
        static inject = ["leaf"]
      }
      class Right {
        static inject = ["leaf"]
      }
      class Root {
        static inject = ["left", "right"]
      }

      pumpIt
        .bindClass("leaf", Leaf)
        .bindClass("left", Left)
        .bindClass("right", Right)
        .bindClass("root", Root)

      expect(() => pumpIt.resolve("root")).not.toThrow()
    })

    test("the same key can be injected twice into one binding", () => {
      const pumpIt = new PumpIt()

      class Leaf {}
      class Root {
        static inject = ["leaf", "leaf"]

        constructor(
          public one: Leaf,
          public two: Leaf,
        ) {}
      }

      pumpIt.bindClass("leaf", Leaf).bindClass("root", Root)

      const root = pumpIt.resolve<Root>("root")

      expect(root.one).toBeInstanceOf(Leaf)
      expect(root.two).toBeInstanceOf(Leaf)
      expect(root.one).not.toBe(root.two)
    })
  })

  describe("container hierarchy", () => {
    test("a container cannot become its own parent", () => {
      const pumpIt = new PumpIt()

      expect(() => pumpIt.setParent(pumpIt)).toThrow("cycle")
    })

    test("a longer parent cycle is rejected", () => {
      const a = new PumpIt("a")
      const b = new PumpIt("b")
      const c = new PumpIt("c")

      b.setParent(a)
      c.setParent(b)

      try {
        a.setParent(c)
      } catch (e) {
        expect((e as PumpitError).code).toBe(ERROR_CODE.PARENT_CYCLE)
      }

      expect(a.getParent()).toBeUndefined()
      expect.assertions(2)
    })

    test("the parent can be detached", () => {
      const parent = new PumpIt()
      const child = parent.child()

      child.setParent(undefined)

      expect(child.getParent()).toBeUndefined()
    })
  })

  describe("unbind", () => {
    test("unbindAll throws on a locked container even when it is empty", () => {
      const pumpIt = new PumpIt()
      pumpIt.lock()

      expect(() => pumpIt.unbindAll()).toThrow("Container is locked")
    })

    test("a singleton that resolved to undefined does not break unbind", () => {
      const pumpIt = new PumpIt()

      pumpIt.bindFactory("key", () => undefined, { scope: SCOPE.SINGLETON })
      pumpIt.resolve("key")

      expect(() => pumpIt.unbind("key")).not.toThrow()
      expect(pumpIt.has("key")).toBe(false)
    })
  })
})
