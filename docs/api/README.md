pumpit

# pumpit

## Table of contents

### Classes

- [PumpIt](classes/PumpIt.md)

### Type aliases

- [AvailableScopes](README.md#availablescopes)
- [AvailableTypes](README.md#availabletypes)
- [BindKey](README.md#bindkey)
- [ClassOptions](README.md#classoptions)
- [ClassValue](README.md#classvalue)
- [FactoryOptions](README.md#factoryoptions)
- [FactoryValue](README.md#factoryvalue)
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

[types.ts:9](https://github.com/ivandotv/pumpit/blob/f276241/src/types.ts#L9)

___

### AvailableTypes

Ƭ **AvailableTypes**: keyof typeof [`TYPE`](README.md#type)

Available types that can be binded

#### Defined in

[types.ts:6](https://github.com/ivandotv/pumpit/blob/f276241/src/types.ts#L6)

___

### BindKey

Ƭ **BindKey**: `string` \| `symbol` \| `Record`<`string`, `any`\>

Type of values that can be used for the bind key

#### Defined in

[types.ts:15](https://github.com/ivandotv/pumpit/blob/f276241/src/types.ts#L15)

___

### ClassOptions

Ƭ **ClassOptions**<`T`, `K`\>: `Object`

Class bind options

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`ClassValue`](README.md#classvalue) |
| `K` | extends [`AvailableScopes`](README.md#availablescopes) = ``"TRANSIENT"`` |

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `scope` | `K` | Scope that is going to be used [AvailableScopes](README.md#availablescopes) |
| `type` | typeof [`CLASS`](README.md#class) | Class constant type [AvailableTypes](README.md#availabletypes) |
| `afterResolve?` | (`data`: { `container`: [`PumpIt`](classes/PumpIt.md) ; `ctx?`: [`ResolveCtx`](README.md#resolvectx) ; `value`: `any`  }) => `void` | callback that is called after the value is resolved, number of calls depends on scope used when registering |
| `beforeResolve?` | (`data`: { `container`: [`PumpIt`](classes/PumpIt.md) ; `ctx?`: [`ResolveCtx`](README.md#resolvectx) ; `value`: `T` extends (...`args`: `any`[]) => `any` ? (...`args`: `ConstructorParameters`<`T`\>) => `T` : (...`args`: `ConstructorParameters`<`T`[``"value"``]\>) => `T`[``"value"``]  }, ...`deps`: `T` extends (...`args`: `any`[]) => `any` ? `ConstructorParameters`<`T`\> : `ConstructorParameters`<`T`[``"value"``]\>) => `any` | callback that is called before the value is resolved, number of calls depends on scope used when registering |
| `unbind?` | (`data`: { `container`: [`PumpIt`](classes/PumpIt.md) ; `dispose`: `boolean` ; `value`: `K` extends ``"SINGLETON"`` ? `any` : `undefined`  }) => `void` | callback that is called before the value is removed from the container. This is only executed for values that are SINGLETONS |

#### Defined in

[types.ts:26](https://github.com/ivandotv/pumpit/blob/f276241/src/types.ts#L26)

___

### ClassValue

Ƭ **ClassValue**: (...`args`: `any`[]) => `any` \| { `inject`: `InjectionData` ; `value`: (...`args`: `any`[]) => `any`  }

#### Defined in

[types.ts:21](https://github.com/ivandotv/pumpit/blob/f276241/src/types.ts#L21)

___

### FactoryOptions

Ƭ **FactoryOptions**<`T`, `K`\>: `Object`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`FactoryValue`](README.md#factoryvalue) |
| `K` | extends [`AvailableScopes`](README.md#availablescopes) |

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `scope` | `K` | Scope that is going to be used [AvailableScopes](README.md#availablescopes) |
| `type` | typeof [`FACTORY`](README.md#factory) | Factory constant type |
| `afterResolve?` | (`data`: { `container`: [`PumpIt`](classes/PumpIt.md) ; `ctx?`: [`ResolveCtx`](README.md#resolvectx) ; `value`: `any`  }) => `void` | callback that is called after the value is resolved, number of calls depends on scope used when registering |
| `beforeResolve?` | (`data`: { `container`: [`PumpIt`](classes/PumpIt.md) ; `ctx?`: [`ResolveCtx`](README.md#resolvectx) ; `value`: `T` extends (...`args`: `any`[]) => `any` ? `T` : `T`[``"value"``]  }, ...`deps`: `T` extends (...`args`: `any`[]) => `any` ? `Parameters`<`T`\> : `Parameters`<`T`[``"value"``]\>) => `any` | callback that is called before the value is resolved, number of calls depends on scope used when registering |
| `unbind?` | (`data`: { `container`: [`PumpIt`](classes/PumpIt.md) ; `dispose`: `boolean` ; `value`: `K` extends ``"SINGLETON"`` ? `any` : `undefined`  }) => `void` | callback that is called before the value is removed from the container. This is only executed for values that are SINGLETONS |

#### Defined in

[types.ts:73](https://github.com/ivandotv/pumpit/blob/f276241/src/types.ts#L73)

___

### FactoryValue

Ƭ **FactoryValue**: (...`args`: `any`[]) => `any` \| { `inject`: `InjectionData` ; `value`: (...`args`: `any`[]) => `any`  }

#### Defined in

[types.ts:17](https://github.com/ivandotv/pumpit/blob/f276241/src/types.ts#L17)

___

### ResolveCtx

Ƭ **ResolveCtx**: `Record`<`string`, `any`\>

Resolve context that is used per request and passed to the callbacks

#### Defined in

[types.ts:12](https://github.com/ivandotv/pumpit/blob/f276241/src/types.ts#L12)

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
| `CONTAINER_SINGLETON` | ``"CONTAINER_SINGLETON"`` |
| `REQUEST` | ``"REQUEST"`` |
| `SINGLETON` | ``"SINGLETON"`` |
| `TRANSIENT` | ``"TRANSIENT"`` |

#### Defined in

[pumpit.ts:37](https://github.com/ivandotv/pumpit/blob/f276241/src/pumpit.ts#L37)

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

[pumpit.ts:26](https://github.com/ivandotv/pumpit/blob/f276241/src/pumpit.ts#L26)

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

[utils.ts:36](https://github.com/ivandotv/pumpit/blob/f276241/src/utils.ts#L36)

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

[utils.ts:61](https://github.com/ivandotv/pumpit/blob/f276241/src/utils.ts#L61)

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

[utils.ts:130](https://github.com/ivandotv/pumpit/blob/f276241/src/utils.ts#L130)

___

### transform

▸ **transform**(`deps`, `fn`): `Object`

Wrapper function for registering dependencies that can be manipulated before being injected
It gets an array of dependeciens in injection order, and it should return an array

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `deps` | ((`key`: [`BindKey`](README.md#bindkey), `options?`: { `lazy?`: `boolean` ; `optional?`: `boolean`  }) => () => { `key`: [`BindKey`](README.md#bindkey) ; `options`: { `lazy?`: `boolean` ; `optional?`: `boolean`  }  } \| [`BindKey`](README.md#bindkey) \| (`deps`: ([`BindKey`](README.md#bindkey) \| () => { `key`: [`BindKey`](README.md#bindkey) ; `options`: { `lazy?`: `boolean` ; `optional?`: `boolean`  }  })[], `options?`: { `removeUndefined?`: `boolean` ; `setToUndefinedIfEmpty?`: `boolean`  }) => () => { `key`: ({ `key`: [`BindKey`](README.md#bindkey) ; `options`: { `lazy?`: `boolean` ; `optional?`: `boolean`  }  } \| { `key`: { `key`: [`BindKey`](README.md#bindkey) ; `options`: { `optional?`: `boolean`  }  }[] ; `options`: { `optional?`: `boolean` ; `removeUndefined?`: `boolean` ; `setToUndefinedIfEmpty?`: `boolean`  }  })[] = result; `options`: { `optional`: `boolean` = true; `removeUndefined?`: `boolean` ; `setToUndefinedIfEmpty?`: `boolean`  }  })[] | array of dependencies that need to be satisfied see: [BindKey](README.md#bindkey) [get()](README.md#get) [getArray()](README.md#getarray) |
| `fn` | (`data`: { `container`: [`PumpIt`](classes/PumpIt.md) ; `ctx`: [`ResolveCtx`](README.md#resolvectx)  }, ...`deps`: `any`[]) => `any`[] | function that will be called with the resolved dependencies |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `action` | `symbol` |
| `deps` | ((`key`: [`BindKey`](README.md#bindkey), `options?`: { `lazy?`: `boolean` ; `optional?`: `boolean`  }) => () => { `key`: [`BindKey`](README.md#bindkey) ; `options`: { `lazy?`: `boolean` ; `optional?`: `boolean`  }  } \| [`BindKey`](README.md#bindkey) \| (`deps`: ([`BindKey`](README.md#bindkey) \| () => { `key`: [`BindKey`](README.md#bindkey) ; `options`: { `lazy?`: `boolean` ; `optional?`: `boolean`  }  })[], `options?`: { `removeUndefined?`: `boolean` ; `setToUndefinedIfEmpty?`: `boolean`  }) => () => { `key`: ({ `key`: [`BindKey`](README.md#bindkey) ; `options`: { `lazy?`: `boolean` ; `optional?`: `boolean`  }  } \| { `key`: { `key`: [`BindKey`](README.md#bindkey) ; `options`: { `optional?`: `boolean`  }  }[] ; `options`: { `optional?`: `boolean` ; `removeUndefined?`: `boolean` ; `setToUndefinedIfEmpty?`: `boolean`  }  })[] = result; `options`: { `optional`: `boolean` = true; `removeUndefined?`: `boolean` ; `setToUndefinedIfEmpty?`: `boolean`  }  })[] |
| `fn` | (`data`: { `container`: [`PumpIt`](classes/PumpIt.md) ; `ctx`: [`ResolveCtx`](README.md#resolvectx)  }, ...`deps`: `any`[]) => `any`[] |

#### Defined in

[utils.ts:116](https://github.com/ivandotv/pumpit/blob/f276241/src/utils.ts#L116)
