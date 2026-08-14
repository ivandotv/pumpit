import { describe, expect, test, vi } from "vitest"
import { PumpIt, SCOPE } from "../pumpit"
import { ERROR_CODE, PumpitError } from "../pumpit-error"

describe("Container API", () => {
  describe("tryResolve", () => {
    test("returns undefined instead of throwing for an unbound key", () => {
      const pumpIt = new PumpIt()

      expect(pumpIt.tryResolve("nope")).toBeUndefined()
    })

    test("resolves normally when the key is bound", () => {
      const pumpIt = new PumpIt()
      class TestA {}
      pumpIt.bindClass(TestA, TestA)

      expect(pumpIt.tryResolve(TestA)).toBeInstanceOf(TestA)
    })

    test("still throws when a required dependency is missing", () => {
      const pumpIt = new PumpIt()

      class TestA {
        static inject = ["missing"]
      }
      pumpIt.bindClass(TestA, TestA)

      expect(() => pumpIt.tryResolve(TestA)).toThrow("not found")
    })

    test("searches the parent container", () => {
      const parent = new PumpIt()
      const child = parent.child()
      parent.bindValue("key", "value")

      expect(child.tryResolve("key")).toBe("value")
    })

    test("runs post construct hooks like resolve does", () => {
      const pumpIt = new PumpIt()
      const postConstruct = vi.fn()

      class TestA {
        postConstruct() {
          postConstruct()
        }
      }
      pumpIt.bindClass(TestA, TestA)
      pumpIt.tryResolve(TestA)

      expect(postConstruct).toHaveBeenCalledTimes(1)
    })
  })

  describe("getKeys", () => {
    test("lists the keys bound on the container", () => {
      const pumpIt = new PumpIt()
      const symbolKey = Symbol("sym")
      class TestA {}

      pumpIt
        .bindValue("value", 1)
        .bindClass(TestA, TestA)
        .bindFactory(symbolKey, () => 2)

      expect(pumpIt.getKeys()).toEqual(["value", TestA, symbolKey])
    })

    test("does not include parent keys by default", () => {
      const parent = new PumpIt()
      const child = parent.child()

      parent.bindValue("parent_key", 1)
      child.bindValue("child_key", 2)

      expect(child.getKeys()).toEqual(["child_key"])
    })

    test("includes parent keys when asked", () => {
      const parent = new PumpIt()
      const child = parent.child()

      parent.bindValue("parent_key", 1)
      child.bindValue("child_key", 2)

      expect(child.getKeys(true)).toEqual(["child_key", "parent_key"])
    })

    test("a shadowed key is reported once", () => {
      const parent = new PumpIt()
      const child = parent.child()

      parent.bindValue("shared", 1)
      child.bindValue("shared", 2)

      expect(child.getKeys(true)).toEqual(["shared"])
    })

    test("reflects unbinding", () => {
      const pumpIt = new PumpIt()
      pumpIt.bindValue("a", 1).bindValue("b", 2)
      pumpIt.unbind("a")

      expect(pumpIt.getKeys()).toEqual(["b"])
    })
  })

  describe("replace", () => {
    test("binding an existing key throws without replace", () => {
      const pumpIt = new PumpIt()
      pumpIt.bindValue("key", 1)

      expect(() => pumpIt.bindValue("key", 2)).toThrow("already exists")
    })

    test("replace swaps a bound value", () => {
      const pumpIt = new PumpIt()
      pumpIt.bindValue("key", 1)
      pumpIt.bindValue("key", 2, { replace: true })

      expect(pumpIt.resolve("key")).toBe(2)
    })

    test("replace swaps a bound class", () => {
      const pumpIt = new PumpIt()
      class TestA {}
      class TestB {}

      pumpIt.bindClass("key", TestA)
      pumpIt.bindClass("key", TestB, { replace: true })

      expect(pumpIt.resolve("key")).toBeInstanceOf(TestB)
    })

    test("replace swaps a bound factory", () => {
      const pumpIt = new PumpIt()

      pumpIt.bindFactory("key", () => "one")
      pumpIt.bindFactory("key", () => "two", { replace: true })

      expect(pumpIt.resolve("key")).toBe("two")
    })

    test("replacing drops the cached singleton and disposes it", () => {
      const pumpIt = new PumpIt()
      const disposeCall = vi.fn()

      class Old {
        dispose() {
          disposeCall()
        }
      }
      class New {}

      pumpIt.bindClass("key", Old, { scope: SCOPE.SINGLETON })
      pumpIt.resolve("key")

      pumpIt.bindClass("key", New, { scope: SCOPE.SINGLETON, replace: true })

      expect(disposeCall).toHaveBeenCalledTimes(1)
      expect(pumpIt.resolve("key")).toBeInstanceOf(New)
    })

    test("replace still respects the lock", () => {
      const pumpIt = new PumpIt()
      pumpIt.bindValue("key", 1)
      pumpIt.lock()

      expect(() => pumpIt.bindValue("key", 2, { replace: true })).toThrow(
        "Container is locked",
      )
    })

    test("replace works on a key that is not bound yet", () => {
      const pumpIt = new PumpIt()

      expect(() => pumpIt.bindValue("key", 1, { replace: true })).not.toThrow()
      expect(pumpIt.resolve("key")).toBe(1)
    })
  })

  describe("disposal", () => {
    test("Symbol.dispose is preferred over a dispose method", () => {
      const pumpIt = new PumpIt()
      const symbolDispose = vi.fn()
      const methodDispose = vi.fn()

      class TestA {
        [Symbol.dispose]() {
          symbolDispose()
        }

        dispose() {
          methodDispose()
        }
      }

      pumpIt.bindClass("key", TestA, { scope: SCOPE.SINGLETON })
      pumpIt.resolve("key")
      pumpIt.unbind("key")

      expect(symbolDispose).toHaveBeenCalledTimes(1)
      expect(methodDispose).not.toHaveBeenCalled()
    })

    test("a plain dispose method still works", () => {
      const pumpIt = new PumpIt()
      const methodDispose = vi.fn()

      class TestA {
        dispose() {
          methodDispose()
        }
      }

      pumpIt.bindClass("key", TestA, { scope: SCOPE.SINGLETON })
      pumpIt.resolve("key")
      pumpIt.unbind("key")

      expect(methodDispose).toHaveBeenCalledTimes(1)
    })

    test("the container itself is disposable", () => {
      const pumpIt = new PumpIt()
      const disposeCall = vi.fn()

      class TestA {
        dispose() {
          disposeCall()
        }
      }

      pumpIt.bindClass("key", TestA, { scope: SCOPE.SINGLETON })
      pumpIt.resolve("key")

      pumpIt[Symbol.dispose]()

      expect(disposeCall).toHaveBeenCalledTimes(1)
      expect(pumpIt.getKeys()).toEqual([])
    })

    test("`using` unbinds everything on scope exit", () => {
      const disposeCall = vi.fn()

      class TestA {
        dispose() {
          disposeCall()
        }
      }

      let seen: PumpIt | undefined
      {
        using pumpIt = new PumpIt()
        pumpIt.bindClass("key", TestA, { scope: SCOPE.SINGLETON })
        pumpIt.resolve("key")
        seen = pumpIt

        expect(seen.getKeys()).toEqual(["key"])
      }

      expect(disposeCall).toHaveBeenCalledTimes(1)
      expect(seen.getKeys()).toEqual([])
    })
  })

  describe("error codes", () => {
    test("every container error is a PumpitError with a code", () => {
      const pumpIt = new PumpIt()

      const cases: [() => void, string][] = [
        [() => pumpIt.resolve("nope"), ERROR_CODE.KEY_NOT_FOUND],
        [() => pumpIt.unbind("nope"), ERROR_CODE.KEY_NOT_FOUND],
        [
          () => {
            pumpIt.bindValue("dupe", 1)
            pumpIt.bindValue("dupe", 2)
          },
          ERROR_CODE.KEY_ALREADY_EXISTS,
        ],
        [() => pumpIt.setParent(pumpIt), ERROR_CODE.PARENT_CYCLE],
      ]

      for (const [fn, code] of cases) {
        try {
          fn()
          throw new Error("expected the call to throw")
        } catch (e) {
          expect(e).toBeInstanceOf(PumpitError)
          expect((e as PumpitError).code).toBe(code)
        }
      }

      const locked = new PumpIt()
      locked.lock()
      try {
        locked.bindValue("key", 1)
      } catch (e) {
        expect((e as PumpitError).code).toBe(ERROR_CODE.CONTAINER_LOCKED)
      }
    })

    test("errors are named", () => {
      const pumpIt = new PumpIt()

      try {
        pumpIt.resolve("nope")
      } catch (e) {
        expect((e as Error).name).toBe("PumpitError")
      }

      expect.assertions(1)
    })

    test("a plain object key is described in the message", () => {
      const pumpIt = new PumpIt()
      const objectKey = {}

      expect(() => pumpIt.resolve(objectKey)).toThrow("[object Object]")
    })

    test("a circular reference between anonymous classes still reports a path", () => {
      const pumpIt = new PumpIt()
      // a class returned from a function gets no inferred name
      const anonymous = () => class {}

      pumpIt.bindClass("a", { value: anonymous(), inject: ["b"] })
      pumpIt.bindClass("b", { value: anonymous(), inject: ["a"] })

      expect(() => pumpIt.resolve("a")).toThrow(
        "Circular reference detected: [ a ] -> [ b ] -> [ a ]",
      )
    })

    test("the validation message is pluralised", () => {
      const pumpIt = new PumpIt()

      class TestA {
        static inject = ["one", "two"]
      }
      pumpIt.bindClass(TestA, TestA)

      expect(() => pumpIt.validate()).toThrow("2 unresolved dependencies")
    })
  })

  describe("lock", () => {
    test("isLocked reflects the lock", () => {
      const pumpIt = new PumpIt()

      expect(pumpIt.isLocked()).toBe(false)
      pumpIt.lock()
      expect(pumpIt.isLocked()).toBe(true)
    })
  })
})
