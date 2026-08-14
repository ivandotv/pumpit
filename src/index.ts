//TS problem: https://github.com/microsoft/TypeScript/issues/50152]
export * from "./pumpit.js"
export * from "./types.js"
export * from "./pumpit-error.js"

import { INJECT_KEY, get, registerInjections } from "./utils.js"

export { get, INJECT_KEY, registerInjections }

// types that appear in the public signatures above, so consumers can name them
export type {
  Injectable,
  Injection,
  InjectionData,
  InjectionFn,
  InjectionOptions,
  ParsedInjectionData,
} from "./utils.js"
