import { describe, expect, expectTypeOf, test } from "vitest"
import { PumpIt } from "../pumpit"
import { token } from "../utils"

type Config = { url: string; retries: number }

class Logger {
  log(msg: string) {
    return msg
  }
}

describe("Typed tokens", () => {
  test("a token is a symbol and works as a bind key", () => {
    const pumpIt = new PumpIt()
    const configToken = token<Config>("config")

    expect(typeof configToken).toBe("symbol")

    const config = { url: "https://example.com", retries: 3 }
    pumpIt.bindValue(configToken, config)

    expect(pumpIt.resolve(configToken)).toBe(config)
  })

  test("the description shows up in error messages", () => {
    const pumpIt = new PumpIt()
    const configToken = token<Config>("app_config")

    expect(() => pumpIt.resolve(configToken)).toThrow("app_config")
  })

  test("two tokens with the same description are different keys", () => {
    const pumpIt = new PumpIt()
    const one = token<string>("same")
    const two = token<string>("same")

    pumpIt.bindValue(one, "one").bindValue(two, "two")

    expect(pumpIt.resolve(one)).toBe("one")
    expect(pumpIt.resolve(two)).toBe("two")
  })

  test("a class bound to a token resolves to the instance", () => {
    const pumpIt = new PumpIt()
    const loggerToken = token<Logger>("logger")

    pumpIt.bindClass(loggerToken, Logger)

    expect(pumpIt.resolve(loggerToken)).toBeInstanceOf(Logger)
  })

  test("a factory bound to a token resolves to its return value", () => {
    const pumpIt = new PumpIt()
    const greetToken = token<string>("greet")

    pumpIt.bindFactory(greetToken, () => "hello")

    expect(pumpIt.resolve(greetToken)).toBe("hello")
  })

  test("tokens can be injected like any other key", () => {
    const pumpIt = new PumpIt()
    const configToken = token<Config>("config")
    const config = { url: "https://example.com", retries: 3 }

    class Service {
      static inject = [configToken]

      constructor(public config: Config) {}
    }

    pumpIt.bindValue(configToken, config)
    pumpIt.bindClass(Service, Service)

    expect(pumpIt.resolve(Service).config).toBe(config)
  })

  // `expectTypeOf` still evaluates its argument, so everything asserted on here
  // is bound first and the assertions double as runtime checks
  describe("types", () => {
    test("resolve infers the type carried by the token", () => {
      const pumpIt = new PumpIt()
      const configToken = token<Config>("config")
      pumpIt.bindValue(configToken, { url: "https://example.com", retries: 3 })

      expectTypeOf(pumpIt.resolve(configToken)).toEqualTypeOf<Config>()
    })

    test("tryResolve widens the token type with undefined", () => {
      const pumpIt = new PumpIt()
      const configToken = token<Config>("config")

      expectTypeOf(pumpIt.tryResolve(configToken)).toEqualTypeOf<
        Config | undefined
      >()
    })

    test("resolve infers the instance type when a class is the key", () => {
      const pumpIt = new PumpIt()
      pumpIt.bindClass(Logger, Logger)

      expectTypeOf(pumpIt.resolve(Logger)).toEqualTypeOf<Logger>()
    })

    test("an explicit type argument still works with a plain key", () => {
      const pumpIt = new PumpIt()
      pumpIt.bindClass("logger", Logger)

      expectTypeOf(pumpIt.resolve<Logger>("logger")).toEqualTypeOf<Logger>()
    })

    test("binding the wrong value type to a token is a type error", () => {
      const pumpIt = new PumpIt()

      // @ts-expect-error a number is not a Config
      pumpIt.bindValue(token<Config>("a"), 42)

      // @ts-expect-error Logger does not produce a Config
      pumpIt.bindClass(token<Config>("b"), Logger)

      // @ts-expect-error the factory returns a string, not a Config
      pumpIt.bindFactory(token<Config>("c"), () => "nope")

      expect(pumpIt.getKeys()).toHaveLength(3)
    })

    test("a plain symbol is not treated as a token", () => {
      const pumpIt = new PumpIt()
      const plain = Symbol("plain")

      pumpIt.bindValue(plain, 42)

      expectTypeOf(pumpIt.resolve(plain)).toEqualTypeOf<unknown>()
    })
  })
})
