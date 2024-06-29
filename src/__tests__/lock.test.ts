import { describe, expect, test } from "vitest"
import { PumpIt } from "../pumpit"
import { PumpitError } from "../pumpit-error"

describe("Locking", () => {
  describe("bind", () => {
    test("throw if trying to bind class when container is locked", () => {
      const pumpIt = new PumpIt()

      class TestA {}
      class TestB {}

      pumpIt.bindClass(TestA, TestA).bindClass(TestB, TestB)
      pumpIt.lock()
      try {
        pumpIt.bindClass(TestB, TestB)
      } catch (e) {
        expect(e.message).toEqual("Container is locked")
      }
      expect.assertions(1)
    })

    test("throw if trying to bind value when container is locked", () => {
      const pumpIt = new PumpIt()
      pumpIt.lock()

      try {
        pumpIt.bindValue("key", "value")
      } catch (e) {
        expect(e.message).toEqual("Container is locked")
      }
      expect.assertions(1)
    })

    test("throw if trying to bind factory when container is locked", () => {
      const pumpIt = new PumpIt()
      pumpIt.lock()

      try {
        pumpIt.bindFactory("key", () => "value")
      } catch (e) {
        expect(e.message).toEqual("Container is locked")
      }
      expect.assertions(1)
    })
  })

  describe("unbind", () => {
    test("throw if trying to unbind factory when container is locked", () => {
      const pumpIt = new PumpIt()
      const key = Symbol("key")
      pumpIt.bindFactory(key, () => "value")
      pumpIt.lock()

      try {
        pumpIt.unbind(key)
      } catch (e) {
        expect(e.message).toEqual("Container is locked")
      }
      expect.assertions(1)
    })

    test("throw if trying to unbind class when container is locked", () => {
      const pumpIt = new PumpIt()
      class TestA {}
      pumpIt.bindClass(TestA, TestA)
      pumpIt.lock()

      try {
        pumpIt.unbind(TestA)
      } catch (e) {
        expect(e.message).toEqual("Container is locked")
      }
      expect.assertions(1)
    })

    test("throw if trying to unbind class when container is locked", () => {
      const pumpIt = new PumpIt()
      const key = Symbol("key")
      pumpIt.bindValue(key, "value")
      pumpIt.lock()

      try {
        pumpIt.unbind(key)
      } catch (e) {
        expect(e.message).toEqual("Container is locked")
      }
      expect.assertions(1)
    })

    test("throw if trying to unbind all when container is locked", () => {
      const pumpIt = new PumpIt()
      const key = Symbol("key")
      class TestA {}

      pumpIt.bindValue(key, "value")
      pumpIt.bindClass(TestA, TestA)

      pumpIt.lock()

      try {
        pumpIt.unbindAll()
      } catch (e) {
        expect(e.message).toEqual("Container is locked")
      }
      expect.assertions(1)
    })
  })
})
