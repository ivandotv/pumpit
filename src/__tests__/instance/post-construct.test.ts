import { describe, expect, test } from "vitest"
import { PumpIt } from "../../pumpit"

describe("Post construct", () => {
  test("Run post construct method on the class", () => {
    const pumpIt = new PumpIt()

    let inc = 0
    class TestA {
      postConstruct() {
        inc++
      }
    }

    pumpIt.bindClass(TestA, TestA)

    pumpIt.resolve<TestA>(TestA)

    expect(inc).toBe(1)
  })

  test("Run post construct methods in bottom up order", () => {
    const pumpIt = new PumpIt()

    let postConstructOrder = ""
    class TestA {
      postConstruct() {
        postConstructOrder += "A"
      }
    }
    class TestB {
      static inject = [TestA]

      postConstruct() {
        postConstructOrder += "B"
      }
    }

    class TestC {
      static inject = [TestB]

      postConstruct() {
        postConstructOrder += "C"
      }
    }

    pumpIt.bindClass(TestA, TestA)
    pumpIt.bindClass(TestB, TestB)
    pumpIt.bindClass(TestC, TestC)

    pumpIt.resolve<TestC>(TestC)

    expect(postConstructOrder).toBe("ABC")
  })

  test("Call only once when scope is singleton", () => {
    const pumpIt = new PumpIt()

    let count = 0

    class TestA {
      postConstruct() {
        count += 1
      }
    }
    pumpIt.bindClass(TestA, TestA, { scope: "SINGLETON" })

    pumpIt.resolve<TestA>(TestA)
    pumpIt.resolve<TestA>(TestA)
    pumpIt.resolve<TestA>(TestA)
    pumpIt.resolve<TestA>(TestA)

    expect(count).toBe(1)
  })

  test("Call inherited post construct method", () => {
    const pumpIt = new PumpIt()

    let count = 0

    class TestA {
      postConstruct() {
        count += 1
      }
    }
    class TestB extends TestA {}

    pumpIt.bindClass(TestB, TestB)
    pumpIt.resolve<TestB>(TestB)

    expect(count).toBe(1)
  })
})
