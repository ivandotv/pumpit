import type { ClassOptions, FactoryOptions, ValueOptions } from './types'
import { InjectionData } from './utils'

export type ClassPoolData = ClassOptions & {
  value: { new (...args: any[]): any; inject?: InjectionData }
}

export type ValuePoolData = ValueOptions & { value: any }

export type FactoryPoolData = FactoryOptions & {
  value: { (...args: any[]): any; inject?: InjectionData }
}

export type PoolData = ValuePoolData | ClassPoolData | FactoryPoolData
