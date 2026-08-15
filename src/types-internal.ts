import type { SCOPE, TYPE } from "./pumpit"
import type {
  BindKey,
  ClassConstructor,
  ClassOptions,
  FactoryFn,
  FactoryOptions,
} from "./types"
import type { ParsedInjectionData } from "./utils"

/**
 * What the pool actually holds for class and factory bindings: the bound value
 * wrapped in a callable that applies `new` (class) or calls it (factory),
 * with the parsed injection data attached.
 */
export type ResolverFn = ((...args: any[]) => any) & {
  /**
   * Dependencies to resolve before invoking the resolver. Parsed once when the
   * value is bound, since injection metadata cannot change afterwards.
   */
  inject: ParsedInjectionData[] | undefined
  /** The unwrapped class or factory that was bound */
  original: ClassConstructor | FactoryFn
}

export type ClassPoolData = ClassOptions & {
  value: ResolverFn
}

/** Availalbes types and scopes for simple values.
 * Values that are binded with {@link PumpIt.bindValue | PumpIt.bindValue}
 */
export type ValueOptions = {
  type: typeof TYPE.VALUE
  scope: typeof SCOPE.SINGLETON
}

export type ValuePoolData = ValueOptions & { value: unknown }

export type FactoryPoolData = FactoryOptions & {
  value: ResolverFn
}

export type PoolData = ValuePoolData | ClassPoolData | FactoryPoolData

/**
 * State that lives for exactly one {@link PumpIt.resolve | PumpIt.resolve()}
 * call, and is shared with parent containers when resolution crosses into one.
 * Every field is allocated on first use, since most resolve calls need none of
 * them.
 */
export type RequestCtx = {
  /** Values already built for {@link SCOPE.REQUEST} bindings */
  requestCache: Map<BindKey, any> | undefined
  /** Keys currently being constructed, deepest last. Doubles as the path
   * reported when a circular reference is detected. */
  stack: BindKey[] | undefined
  /** Instances waiting for their `postConstruct` hook to run */
  postConstruct: PostConstruct[] | undefined
}

/** An instance that wants a callback once the whole resolve call completes*/
export type PostConstruct = { postConstruct: () => void }
