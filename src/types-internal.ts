import type { SCOPE, TYPE } from "./pumpit"
import type {
  BindKey,
  ClassConstructor,
  ClassOptions,
  FactoryFn,
  FactoryOptions,
} from "./types"
import type { InjectionData } from "./utils"

type InternalResolveCtx = {
  data?: Record<string, any>
}

/**
 * What the pool actually holds for class and factory bindings: the bound value
 * wrapped in a callable that applies `new` (class) or calls it (factory),
 * with the parsed injection data attached.
 */
export type ResolverFn = ((...args: any[]) => any) & {
  /** Dependencies to resolve before invoking the resolver */
  inject: InjectionData | undefined
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

export type RequestCtx = {
  singletonCache: Map<BindKey, any>
  requestCache: Map<BindKey, any>
  transientCache: Map<BindKey, any>
  // only class and factory bindings are tracked here, values resolve immediately
  requestedKeys: Map<BindKey, { constructed: boolean; value: ResolverFn }>
  ctx?: InternalResolveCtx
  postConstruct: PostConstruct[]
}

/** An instance that wants a callback once the whole resolve call completes*/
export type PostConstruct = { postConstruct: () => void }
