import { describe, expect, test } from "vitest"
import { PumpIt, SCOPE } from "../pumpit"
import { registerInjections } from "../utils"

describe("injection helper", () => {
  describe("factory", () => {
    test("use helper to inject in to factory", () => {
      const pumpIt = new PumpIt()

      type Fn = ReturnType<typeof factory>

      function factory(a: TestA, b: TestB) {
        return () => {
          return { a, b }
        }
      }

      class TestA {}
      class TestB {}

      registerInjections(factory, [TestA, TestB])

      pumpIt
        .bindFactory(factory, factory)
        .bindClass(TestA, TestA)
        .bindClass(TestB, TestB)

      const result = pumpIt.resolve<Fn>(factory)()

      expect(result.a).toBeInstanceOf(TestA)
      expect(result.b).toBeInstanceOf(TestB)
    })
  })

  describe("class", () => {
    test("use helper to inject in to class", () => {
      const pumpIt = new PumpIt()

      class TestA {}
      class TestB {}
      class TestC {
        constructor(
          public a: TestA,
          public b: TestB,
        ) {}
      }

      registerInjections(TestC, [TestA, TestB])

      pumpIt
        .bindClass(TestA, TestA)
        .bindClass(TestB, TestB)
        .bindClass(TestC, TestC)

      const result = pumpIt.resolve<TestC>(TestC)

      expect(result.a).toBeInstanceOf(TestA)
      expect(result.b).toBeInstanceOf(TestB)
    })
  })
})
