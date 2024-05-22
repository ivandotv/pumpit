import type { SCOPE, TYPE } from "./pumpit"
import type {
  AvailableScopes,
  BindKey,
  ClassOptions,
  ClassValue,
  FactoryOptions,
  FactoryValue,
} from "./types"

type InternalResolveCtx = {
  data?: Record<string, any>
}

export type ClassPoolData = ClassOptions<ClassValue, AvailableScopes> & {
  value: ClassValue
}

/** Availalbes types and scopes for simple values.
 * Values that are binded with {@link PumpIt.bindValue | PumpIt.bindValue}
 */
export type ValueOptions = {
  type: typeof TYPE.VALUE
  scope: typeof SCOPE.SINGLETON
}

export type ValuePoolData = ValueOptions & { value: any }

export type FactoryPoolData = FactoryOptions<FactoryValue, AvailableScopes> & {
  value: FactoryValue
}

export type PoolData = ValuePoolData | ClassPoolData | FactoryPoolData

export type RequestCtx = {
  singletonCache: Map<BindKey, any>
  requestCache: Map<BindKey, any>
  transientCache: Map<BindKey, any>
  requestedKeys: Map<BindKey, { constructed: boolean; value: any }>
  ctx?: InternalResolveCtx
  postConstruct: { postConstruct: () => void }[]
}
