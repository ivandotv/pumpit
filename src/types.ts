import { TYPE, SCOPE } from './pumpa'
export type AvailableTypes = keyof typeof TYPE
export type AvailableScopes = keyof typeof SCOPE
export type ChildOptions = {
  shareSingletons?: boolean
}
