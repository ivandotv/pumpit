pumpit

# pumpit

## Table of contents

### Classes

- [PumpIt](classes/PumpIt.md)

### Type aliases

- [AvailableScopes](README.md#availablescopes)
- [AvailableTypes](README.md#availabletypes)
- [BindKey](README.md#bindkey)
- [ChildOptions](README.md#childoptions)
- [ClassOptions](README.md#classoptions)
- [FactoryOptions](README.md#factoryoptions)
- [ResolveCtx](README.md#resolvectx)

### Variables

- [SCOPE](README.md#scope)
- [TYPE](README.md#type)

### Functions

- [get](README.md#get)
- [getArray](README.md#getarray)
- [isProxy](README.md#isproxy)
- [transform](README.md#transform)

## Type aliases

### AvailableScopes

Ƭ **AvailableScopes**: keyof typeof [`SCOPE`](README.md#scope)

Available scopes that can be used

#### Defined in

[types.ts:8](https://github.com/ivandotv/pumpa/blob/b6eab95/src/types.ts#L8)

___

### AvailableTypes

Ƭ **AvailableTypes**: keyof typeof [`TYPE`](README.md#type)

Available types that can be binded

#### Defined in

[types.ts:5](https://github.com/ivandotv/pumpa/blob/b6eab95/src/types.ts#L5)

___

### BindKey

Ƭ **BindKey**: `string` \| `symbol` \| `Record`<`string`, `any`\>

Type of values that can be used for the bind key

#### Defined in

[types.ts:23](https://github.com/ivandotv/pumpa/blob/b6eab95/src/types.ts#L23)

___

### ChildOptions

Ƭ **ChildOptions**: `Object`

Child injector options

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `shareSingletons?` | `boolean` | If singleton values should be satisfied by looking at the parent singleton values |

#### Defined in

[types.ts:17](https://github.com/ivandotv/pumpa/blob/b6eab95/src/types.ts#L17)

___

### ClassOptions

Ƭ **ClassOptions**<`T`, `K`\>: `Object`

Class bind options

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends (...`args`: `any`[]) => `any` |
| `K` | extends [`AvailableScopes`](README.md#availablescopes) = ``"TRANSIENT"`` |

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `scope` | `K` | Scope that is going to be used [AvailableScopes](README.md#availablescopes) |
| `type` | typeof [`CLASS`](README.md#class) | Class constant type [AvailableTypes](README.md#availabletypes) |
| `afterResolve?` | (`data`: { `container`: [`PumpIt`](classes/PumpIt.md) ; `ctx?`: [`ResolveCtx`](README.md#resolvectx) ; `value`: `InstanceType`<`T`\>  }) => `void` | callback that is called after the value is resolved, number of calls depends on scope used when registering |
| `beforeResolve?` | (`data`: { `container`: [`PumpIt`](classes/PumpIt.md) ; `ctx?`: [`ResolveCtx`](README.md#resolvectx) ; `deps?`: `ConstructorParameters`<`T`\> ; `value`: (...`args`: `ConstructorParameters`<`T`\>) => `T`  }) => `T` | callback that is called before the value is resolved, number of calls depends on scope used when registering |
| `unbind?` | (`data`: { `container`: [`PumpIt`](classes/PumpIt.md) ; `dispose`: `boolean` ; `value`: `K` extends ``"SINGLETON"`` ? `InstanceType`<`T`\> : `undefined`  }) => `void` | callback that is called before the value is removed from the container. This is only executed for values that are SINGLETONS |

#### Defined in

[types.ts:26](https://github.com/ivandotv/pumpa/blob/b6eab95/src/types.ts#L26)

___

### FactoryOptions

Ƭ **FactoryOptions**<`T`, `K`\>: `Object`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends (...`args`: `any`[]) => `any` |
| `K` | extends [`AvailableScopes`](README.md#availablescopes) |

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `scope` | `K` | Scope that is going to be used [AvailableScopes](README.md#availablescopes) |
| `type` | typeof [`FACTORY`](README.md#factory) | Factory constant type |
| `afterResolve?` | (`data`: { `container`: [`PumpIt`](classes/PumpIt.md) ; `ctx?`: [`ResolveCtx`](README.md#resolvectx) ; `value`: `ReturnType`<`T`\>  }) => `void` | callback that is called after the value is resolved, number of calls depends on scope used when registering |
| `beforeResolve?` | (`data`: { `container`: [`PumpIt`](classes/PumpIt.md) ; `ctx?`: [`ResolveCtx`](README.md#resolvectx) ; `deps?`: `Parameters`<`T`\> ; `value`: `T`  }) => `ReturnType`<`T`\> | callback that is called before the value is resolved, number of calls depends on scope used when registering |
| `unbind?` | (`data`: { `container`: [`PumpIt`](classes/PumpIt.md) ; `dispose`: `boolean` ; `value`: `K` extends ``"SINGLETON"`` ? `ReturnType`<`T`\> : `undefined`  }) => `void` | callback that is called before the value is removed from the container. This is only executed for values that are SINGLETONS |

#### Defined in

[types.ts:65](https://github.com/ivandotv/pumpa/blob/b6eab95/src/types.ts#L65)

___

### ResolveCtx

Ƭ **ResolveCtx**: `Object`

Resolve context that is used per request and passed to the callbacks

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `data?` | `Record`<`string`, `any`\> | Arbitrary data that can be used |

#### Defined in

[types.ts:11](https://github.com/ivandotv/pumpa/blob/b6eab95/src/types.ts#L11)

## Variables

### SCOPE

• `Const` **SCOPE**: `Object`

Constants that represent the type of scopes that can be used
SINGLETON - value is resolved only once
TRANSIENT - value is resolved everytime it is requested
REQUEST - value is resolved once per request [PumpIt.resolve()](classes/PumpIt.md#resolve)

#### Type declaration

| Name | Type |
| :------ | :------ |
| `REQUEST` | ``"REQUEST"`` |
| `SINGLETON` | ``"SINGLETON"`` |
| `TRANSIENT` | ``"TRANSIENT"`` |

#### Defined in

pumpit.ts:36

___

### TYPE

• `Const` **TYPE**: `Object`

Constants that represent the type of values that can be binded

#### Type declaration

| Name | Type |
| :------ | :------ |
| `CLASS` | ``"CLASS"`` |
| `FACTORY` | ``"FACTORY"`` |
| `VALUE` | ``"VALUE"`` |

#### Defined in

pumpit.ts:25

## Functions

### get

▸ **get**(`key`, `options?`): () => { `key`: [`BindKey`](README.md#bindkey) ; `options`: { `lazy?`: `boolean` ; `optional?`: `boolean`  }  }

get dependency by key

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `key` | [`BindKey`](README.md#bindkey) | dependency [BindKey](README.md#bindkey) |
| `options?` | `Object` | options for the resove process |
| `options.lazy?` | `boolean` | in case of circular dependency proxy object will be used |
| `options.optional?` | `boolean` | if the dependency cannot be resolved *undefined* will be used |

#### Returns

`fn`

▸ (): `Object`

##### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `key` | [`BindKey`](README.md#bindkey) |
| `options` | { `lazy?`: `boolean` ; `optional?`: `boolean`  } |
| `options.lazy?` | `boolean` |
| `options.optional?` | `boolean` |

#### Defined in

[utils.ts:35](https://github.com/ivandotv/pumpa/blob/b6eab95/src/utils.ts#L35)

___

### getArray

▸ **getArray**(`deps`, `options?`): () => { `key`: ({ `key`: [`BindKey`](README.md#bindkey) ; `options`: { `lazy?`: `boolean` ; `optional?`: `boolean`  }  } \| { `key`: { `key`: [`BindKey`](README.md#bindkey) ; `options`: { `optional?`: `boolean`  }  }[] ; `options`: { `optional?`: `boolean` ; `removeUndefined?`: `boolean` ; `setToUndefinedIfEmpty?`: `boolean`  }  })[] = result; `options`: { `optional`: `boolean` = true; `removeUndefined?`: `boolean` ; `setToUndefinedIfEmpty?`: `boolean`  }  }

Get an array of dependencies

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `deps` | ([`BindKey`](README.md#bindkey) \| () => { `key`: [`BindKey`](README.md#bindkey) ; `options`: { `lazy?`: `boolean` ; `optional?`: `boolean`  }  })[] | dependencies to be injected see: [BindKey](README.md#bindkey) [get()](README.md#get) |
| `options?` | `Object` | - |
| `options.removeUndefined?` | `boolean` | if dependency in the array cannot be resolved, nothing will be added to the array in it's place |
| `options.setToUndefinedIfEmpty?` | `boolean` | if the whole array is empty it will be set to **undefined**, otherwise an empty array will be injected |

#### Returns

`fn`

▸ (): `Object`

##### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `key` | ({ `key`: [`BindKey`](README.md#bindkey) ; `options`: { `lazy?`: `boolean` ; `optional?`: `boolean`  }  } \| { `key`: { `key`: [`BindKey`](README.md#bindkey) ; `options`: { `optional?`: `boolean`  }  }[] ; `options`: { `optional?`: `boolean` ; `removeUndefined?`: `boolean` ; `setToUndefinedIfEmpty?`: `boolean`  }  })[] |
| `options` | { `optional`: `boolean` = true; `removeUndefined?`: `boolean` ; `setToUndefinedIfEmpty?`: `boolean`  } |
| `options.optional` | `boolean` |
| `options.removeUndefined?` | `boolean` |
| `options.setToUndefinedIfEmpty?` | `boolean` |

#### Defined in

[utils.ts:60](https://github.com/ivandotv/pumpa/blob/b6eab95/src/utils.ts#L60)

___

### isProxy

▸ **isProxy**(`target`): `boolean`

Helper function to detect if the object passed in is wrapped in injection proxy

#### Parameters

| Name | Type |
| :------ | :------ |
| `target` | `Record`<`string`, `any`\> |

#### Returns

`boolean`

#### Defined in

[utils.ts:129](https://github.com/ivandotv/pumpa/blob/b6eab95/src/utils.ts#L129)

___

### transform

▸ **transform**(`deps`, `fn`): `Object`

Wrapper function for registering dependencies that can be manipulated before being injected
It gets an array of dependeciens in injection order, and it should return an array

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `deps` | ((`key`: [`BindKey`](README.md#bindkey), `options?`: { `lazy?`: `boolean` ; `optional?`: `boolean`  }) => () => { `key`: [`BindKey`](README.md#bindkey) ; `options`: { `lazy?`: `boolean` ; `optional?`: `boolean`  }  } \| [`BindKey`](README.md#bindkey) \| (`deps`: ([`BindKey`](README.md#bindkey) \| () => { `key`: [`BindKey`](README.md#bindkey) ; `options`: { `lazy?`: `boolean` ; `optional?`: `boolean`  }  })[], `options?`: { `removeUndefined?`: `boolean` ; `setToUndefinedIfEmpty?`: `boolean`  }) => () => { `key`: ({ `key`: [`BindKey`](README.md#bindkey) ; `options`: { `lazy?`: `boolean` ; `optional?`: `boolean`  }  } \| { `key`: { `key`: [`BindKey`](README.md#bindkey) ; `options`: { `optional?`: `boolean`  }  }[] ; `options`: { `optional?`: `boolean` ; `removeUndefined?`: `boolean` ; `setToUndefinedIfEmpty?`: `boolean`  }  })[] = result; `options`: { `optional`: `boolean` = true; `removeUndefined?`: `boolean` ; `setToUndefinedIfEmpty?`: `boolean`  }  })[] | array of dependencies that need to be satisfied see: [BindKey](README.md#bindkey) [get()](README.md#get) [getArray()](README.md#getarray) |
| `fn` | (...`args`: `any`[]) => `any`[] | function that will be called with the resolved dependencies |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `action` | `symbol` |
| `deps` | ((`key`: [`BindKey`](README.md#bindkey), `options?`: { `lazy?`: `boolean` ; `optional?`: `boolean`  }) => () => { `key`: [`BindKey`](README.md#bindkey) ; `options`: { `lazy?`: `boolean` ; `optional?`: `boolean`  }  } \| [`BindKey`](README.md#bindkey) \| (`deps`: ([`BindKey`](README.md#bindkey) \| () => { `key`: [`BindKey`](README.md#bindkey) ; `options`: { `lazy?`: `boolean` ; `optional?`: `boolean`  }  })[], `options?`: { `removeUndefined?`: `boolean` ; `setToUndefinedIfEmpty?`: `boolean`  }) => () => { `key`: ({ `key`: [`BindKey`](README.md#bindkey) ; `options`: { `lazy?`: `boolean` ; `optional?`: `boolean`  }  } \| { `key`: { `key`: [`BindKey`](README.md#bindkey) ; `options`: { `optional?`: `boolean`  }  }[] ; `options`: { `optional?`: `boolean` ; `removeUndefined?`: `boolean` ; `setToUndefinedIfEmpty?`: `boolean`  }  })[] = result; `options`: { `optional`: `boolean` = true; `removeUndefined?`: `boolean` ; `setToUndefinedIfEmpty?`: `boolean`  }  })[] |
| `fn` | (...`args`: `any`[]) => `any`[] |

#### Defined in

[utils.ts:115](https://github.com/ivandotv/pumpa/blob/b6eab95/src/utils.ts#L115)
