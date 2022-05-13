import { SCOPE, TYPE } from './pumpit'
import type {
  AvailableScopes,
  BindKey,
  ClassOptions,
  FactoryOptions
} from './types'
import { InjectionData } from './utils'

type InternalResolveCtx = {
  data?: Record<string, any>
}

export type ClassPoolData = ClassOptions<
  new (...args: any[]) => any,
  AvailableScopes
> & {
  value: { new (...args: any[]): any; inject?: InjectionData }
}

/** Availalbes types and scopes for simple values.
 * Values that are binded with {@link PumpIt.bindValue | PumpIt.bindValue}
 */
export type ValueOptions = {
  type: typeof TYPE.VALUE
  scope: typeof SCOPE.SINGLETON
}

export type ValuePoolData = ValueOptions & { value: any }

export type FactoryPoolData = FactoryOptions<
  (...args: any[]) => any,
  AvailableScopes
> & {
  value: { (...args: any[]): any; inject?: InjectionData }
}

export type PoolData = ValuePoolData | ClassPoolData | FactoryPoolData

export type RequestCtx = {
  singletonCache: Map<BindKey, any>
  requestCache: Map<BindKey, any>
  transientCache: Map<BindKey, any>
  requestedKeys: Map<BindKey, { constructed: boolean; value: any }>
  delayed: Map<
    BindKey,
    {
      proxy: Record<string, any>
      proxyTarget: Record<string, { current: any }> | { (): any; current: any }
    }
  >
  ctx?: InternalResolveCtx
}
