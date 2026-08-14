import { describe, expect, test } from "vitest"
import { PumpIt } from "../pumpit"
import {
  ERROR_CODE,
  type PumpitError,
  PumpitValidationError,
} from "../pumpit-error"

describe("Validation", () => {
  test("throw if the dependency is not found", () => {
    const pumpIt = new PumpIt()

    class RequestTest {}
    class TestA {}
    class TestB {
      static inject = [RequestTest, TestA]

      constructor(
        public request: RequestTest,
        public a: TestA,
      ) {}
    }

    pumpIt.bindClass(TestA, TestA).bindClass(TestB, TestB)

    try {
      pumpIt.validate()
    } catch (e) {
      expect((e as PumpitValidationError).result).toEqual([
        { key: RequestTest, wantedBy: [TestB] },
      ])
      expect((e as PumpitValidationError).message).toContain("RequestTest")
      expect((e as PumpitError).code).toBe(ERROR_CODE.VALIDATION)
      expect(e).toBeInstanceOf(PumpitValidationError)
    }
    expect.assertions(4)
  })

  test("throw error with multiple dependencies missing", () => {
    const pumpIt = new PumpIt()

    const requestKey = Symbol("requestKey")

    class TestA {
      static inject = [requestKey]

      constructor(public request: any) {}
    }
    class TestB {
      static inject = [TestA, requestKey]

      constructor(
        public request: any,
        public a: TestA,
      ) {}
    }

    pumpIt.bindClass(TestA, TestA).bindClass(TestB, TestB)

    try {
      pumpIt.validate()
    } catch (e) {
      expect((e as PumpitValidationError).result).toEqual([
        { key: requestKey, wantedBy: [TestA, TestB] },
      ])
      expect((e as PumpitValidationError).message).toContain("requestKey")
      expect((e as PumpitError).code).toBe(ERROR_CODE.VALIDATION)
      expect(e).toBeInstanceOf(PumpitValidationError)
    }

    expect.assertions(4)
  })

  test("return validation result instead of throwing", () => {
    const pumpIt = new PumpIt()

    class RequestTest {}
    class TestA {}
    class TestB {
      static inject = [RequestTest, TestA]

      constructor(
        public request: RequestTest,
        public a: TestA,
      ) {}
    }

    pumpIt.bindClass(TestA, TestA).bindClass(TestB, TestB)

    const result = pumpIt.validateSafe()

    expect(result).toEqual({
      valid: false,
      errors: [{ key: RequestTest, wantedBy: [TestB] }],
    })
  })

  test("return result with multiple dependencies missing", () => {
    const pumpIt = new PumpIt()

    const requestKey = Symbol("requestKey")

    class RequestTest {}
    class TestA {
      static inject = [requestKey]

      constructor(public request: RequestTest) {}
    }
    class TestB {
      static inject = [requestKey, TestA]

      constructor(
        public request: RequestTest,
        public a: TestA,
      ) {}
    }

    pumpIt.bindClass(TestA, TestA).bindClass(TestB, TestB)

    const result = pumpIt.validateSafe()

    expect(result).toEqual({
      valid: false,
      errors: [{ key: requestKey, wantedBy: [TestA, TestB] }],
    })
  })

  test("validation does not instantiate the class", () => {
    const pumpIt = new PumpIt()

    class TestA {
      constructor() {
        throw new Error("Class should not be instantiated")
      }
    }

    class TestB {
      static inject = [TestA]

      constructor(public a: TestA) {
        throw new Error("Class should not be instantiated")
      }
    }

    pumpIt.bindClass(TestA, TestA).bindClass(TestB, TestB)

    expect(() => pumpIt.validate()).not.toThrow()
  })

  test("validation does not instantiate the factory", () => {
    const pumpIt = new PumpIt()

    class TestA {}
    class TestB {
      static inject = [TestA]

      constructor(public a: TestA) {}
    }

    pumpIt.bindClass(TestA, TestA).bindFactory(TestB, () => {
      throw new Error("Factory should not run")
    })

    expect(() => pumpIt.validate()).not.toThrow()
  })

  test("validation does not run post construct method of the class", () => {
    const pumpIt = new PumpIt()

    class TestA {
      postConstruct() {
        throw new Error("Post construct should not run")
      }
    }
    class TestB {
      static inject = [TestA]

      constructor(public a: TestA) {}
      postConstruct() {
        throw new Error("Post construct should not run")
      }
    }

    pumpIt.bindClass(TestA, TestA).bindClass(TestB, TestB)

    expect(() => pumpIt.validate()).not.toThrow()
  })
})
