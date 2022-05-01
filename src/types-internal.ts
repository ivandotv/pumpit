import type {
  AvailableScopes,
  ClassOptions,
  FactoryOptions,
  ValueOptions
} from './types'
import { InjectionData } from './utils'

export type ClassPoolData = ClassOptions<
  new (...args: any[]) => any,
  AvailableScopes
> & {
  value: { new (...args: any[]): any; inject?: InjectionData }
}

export type ValuePoolData = ValueOptions & { value: any }

export type FactoryPoolData = FactoryOptions<
  (...args: any[]) => any,
  AvailableScopes
> & {
  value: { (...args: any[]): any; inject?: InjectionData }
}

export type PoolData = ValuePoolData | ClassPoolData | FactoryPoolData
