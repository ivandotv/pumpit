pumpit

# pumpit

## Table of contents

### Classes

- [PumpIt](classes/PumpIt.md)

### Type Aliases

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

## Type Aliases

### AvailableScopes

Ƭ **AvailableScopes**: keyof typeof [`SCOPE`](README.md#scope)

#### Defined in

[types.ts:9](https://github.com/ivandotv/pumpit/blob/fbebf69/src/types.ts#L9)

___

### AvailableTypes

Ƭ **AvailableTypes**: keyof typeof [`TYPE`](README.md#type)

#### Defined in

[types.ts:6](https://github.com/ivandotv/pumpit/blob/fbebf69/src/types.ts#L6)

___

### BindKey

Ƭ **BindKey**: `string` \| `symbol` \| `Record`<`string`, `any`\>

#### Defined in

[types.ts:15](https://github.com/ivandotv/pumpit/blob/fbebf69/src/types.ts#L15)

___

### ClassOptions

Ƭ **ClassOptions**<`T`, `K`\>: `Object`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`ClassValue`](README.md#classvalue) |
| `K` | extends [`AvailableScopes`](README.md#availablescopes) = ``"TRANSIENT"`` |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `scope` | `K` |
| `type` | typeof [`CLASS`](README.md#class) |
| `afterResolve?` | (`data`: { `container`: [`PumpIt`](classes/PumpIt.md) ; `ctx?`: [`ResolveCtx`](README.md#resolvectx) ; `value`: `any`  }) => `void` |
| `beforeResolve?` | (`data`: { `container`: [`PumpIt`](classes/PumpIt.md) ; `ctx?`: [`ResolveCtx`](README.md#resolvectx) ; `value`: `T` extends (...`args`: `any`[]) => `any` ? (...`args`: `ConstructorParameters`<`T`\>) => `T` : (...`args`: `ConstructorParameters`<`T`[``"value"``]\>) => `T`[``"value"``]  }, ...`deps`: `T` extends (...`args`: `any`[]) => `any` ? `ConstructorParameters`<`T`\> : `ConstructorParameters`<`T`[``"value"``]\>) => `any` |
| `unbind?` | (`data`: { `container`: [`PumpIt`](classes/PumpIt.md) ; `dispose`: `boolean` ; `value`: `K` extends ``"SINGLETON"`` ? `any` : `undefined`  }) => `void` |

#### Defined in

[types.ts:26](https://github.com/ivandotv/pumpit/blob/fbebf69/src/types.ts#L26)

___

### ClassValue

Ƭ **ClassValue**: (...`args`: `any`[]) => `any` \| { `inject`: `InjectionData` ; `value`: (...`args`: `any`[]) => `any`  }

#### Defined in

[types.ts:21](https://github.com/ivandotv/pumpit/blob/fbebf69/src/types.ts#L21)

___

### FactoryOptions

Ƭ **FactoryOptions**<`T`, `K`\>: `Object`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`FactoryValue`](README.md#factoryvalue) |
| `K` | extends [`AvailableScopes`](README.md#availablescopes) |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `scope` | `K` |
| `type` | typeof [`FACTORY`](README.md#factory) |
| `afterResolve?` | (`data`: { `container`: [`PumpIt`](classes/PumpIt.md) ; `ctx?`: [`ResolveCtx`](README.md#resolvectx) ; `value`: `any`  }) => `void` |
| `beforeResolve?` | (`data`: { `container`: [`PumpIt`](classes/PumpIt.md) ; `ctx?`: [`ResolveCtx`](README.md#resolvectx) ; `value`: `T` extends (...`args`: `any`[]) => `any` ? `T` : `T`[``"value"``]  }, ...`deps`: `T` extends (...`args`: `any`[]) => `any` ? `Parameters`<`T`\> : `Parameters`<`T`[``"value"``]\>) => `any` |
| `unbind?` | (`data`: { `container`: [`PumpIt`](classes/PumpIt.md) ; `dispose`: `boolean` ; `value`: `K` extends ``"SINGLETON"`` ? `any` : `undefined`  }) => `void` |

#### Defined in

[types.ts:73](https://github.com/ivandotv/pumpit/blob/fbebf69/src/types.ts#L73)

___

### FactoryValue

Ƭ **FactoryValue**: (...`args`: `any`[]) => `any` \| { `inject`: `InjectionData` ; `value`: (...`args`: `any`[]) => `any`  }

#### Defined in

[types.ts:17](https://github.com/ivandotv/pumpit/blob/fbebf69/src/types.ts#L17)

___

### ResolveCtx

Ƭ **ResolveCtx**: `Record`<`string`, `any`\>

#### Defined in

[types.ts:12](https://github.com/ivandotv/pumpit/blob/fbebf69/src/types.ts#L12)

## Variables

### SCOPE

• `Const` **SCOPE**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `CONTAINER_SINGLETON` | ``"CONTAINER_SINGLETON"`` |
| `REQUEST` | ``"REQUEST"`` |
| `SINGLETON` | ``"SINGLETON"`` |
| `TRANSIENT` | ``"TRANSIENT"`` |

#### Defined in

[pumpit.ts:37](https://github.com/ivandotv/pumpit/blob/fbebf69/src/pumpit.ts#L37)

___

### TYPE

• `Const` **TYPE**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `CLASS` | ``"CLASS"`` |
| `FACTORY` | ``"FACTORY"`` |
| `VALUE` | ``"VALUE"`` |

#### Defined in

[pumpit.ts:26](https://github.com/ivandotv/pumpit/blob/fbebf69/src/pumpit.ts#L26)

## Functions

### get

▸ **get**(`key`, `options?`): () => { `key`: [`BindKey`](README.md#bindkey) ; `options`: { `lazy?`: `boolean` ; `optional?`: `boolean`  }  }

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | [`BindKey`](README.md#bindkey) |
| `options?` | `Object` |
| `options.lazy?` | `boolean` |
| `options.optional?` | `boolean` |

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

___

### getArray

▸ **getArray**(`deps`, `options?`): () => { `key`: ({ `key`: [`BindKey`](README.md#bindkey) ; `options`: { `lazy?`: `boolean` ; `optional?`: `boolean`  }  } \| { `key`: { `key`: [`BindKey`](README.md#bindkey) ; `options`: { `optional?`: `boolean`  }  }[] ; `options`: { `optional?`: `boolean` ; `removeUndefined?`: `boolean` ; `setToUndefinedIfEmpty?`: `boolean`  }  })[] = result; `options`: { `optional`: `boolean` = true; `removeUndefined?`: `boolean` ; `setToUndefinedIfEmpty?`: `boolean`  }  }

#### Parameters

| Name | Type |
| :------ | :------ |
| `deps` | ([`BindKey`](README.md#bindkey) \| () => { `key`: [`BindKey`](README.md#bindkey) ; `options`: { `lazy?`: `boolean` ; `optional?`: `boolean`  }  })[] |
| `options?` | `Object` |
| `options.removeUndefined?` | `boolean` |
| `options.setToUndefinedIfEmpty?` | `boolean` |

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

___

### isProxy

▸ **isProxy**(`target`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `target` | `Record`<`string`, `any`\> |

#### Returns

`boolean`

___

### transform

▸ **transform**(`deps`, `fn`): `Object`

#### Parameters

| Name | Type |
| :------ | :------ |
| `deps` | ((`key`: [`BindKey`](README.md#bindkey), `options?`: { `lazy?`: `boolean` ; `optional?`: `boolean`  }) => () => { `key`: [`BindKey`](README.md#bindkey) ; `options`: { `lazy?`: `boolean` ; `optional?`: `boolean`  }  } \| [`BindKey`](README.md#bindkey) \| (`deps`: ([`BindKey`](README.md#bindkey) \| () => { `key`: [`BindKey`](README.md#bindkey) ; `options`: { `lazy?`: `boolean` ; `optional?`: `boolean`  }  })[], `options?`: { `removeUndefined?`: `boolean` ; `setToUndefinedIfEmpty?`: `boolean`  }) => () => { `key`: ({ `key`: [`BindKey`](README.md#bindkey) ; `options`: { `lazy?`: `boolean` ; `optional?`: `boolean`  }  } \| { `key`: { `key`: [`BindKey`](README.md#bindkey) ; `options`: { `optional?`: `boolean`  }  }[] ; `options`: { `optional?`: `boolean` ; `removeUndefined?`: `boolean` ; `setToUndefinedIfEmpty?`: `boolean`  }  })[] = result; `options`: { `optional`: `boolean` = true; `removeUndefined?`: `boolean` ; `setToUndefinedIfEmpty?`: `boolean`  }  })[] |
| `fn` | (`data`: { `container`: [`PumpIt`](classes/PumpIt.md) ; `ctx`: [`ResolveCtx`](README.md#resolvectx)  }, ...`deps`: `any`[]) => `any`[] |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `action` | `symbol` |
| `deps` | ((`key`: [`BindKey`](README.md#bindkey), `options?`: { `lazy?`: `boolean` ; `optional?`: `boolean`  }) => () => { `key`: [`BindKey`](README.md#bindkey) ; `options`: { `lazy?`: `boolean` ; `optional?`: `boolean`  }  } \| [`BindKey`](README.md#bindkey) \| (`deps`: ([`BindKey`](README.md#bindkey) \| () => { `key`: [`BindKey`](README.md#bindkey) ; `options`: { `lazy?`: `boolean` ; `optional?`: `boolean`  }  })[], `options?`: { `removeUndefined?`: `boolean` ; `setToUndefinedIfEmpty?`: `boolean`  }) => () => { `key`: ({ `key`: [`BindKey`](README.md#bindkey) ; `options`: { `lazy?`: `boolean` ; `optional?`: `boolean`  }  } \| { `key`: { `key`: [`BindKey`](README.md#bindkey) ; `options`: { `optional?`: `boolean`  }  }[] ; `options`: { `optional?`: `boolean` ; `removeUndefined?`: `boolean` ; `setToUndefinedIfEmpty?`: `boolean`  }  })[] = result; `options`: { `optional`: `boolean` = true; `removeUndefined?`: `boolean` ; `setToUndefinedIfEmpty?`: `boolean`  }  })[] |
| `fn` | (`data`: { `container`: [`PumpIt`](classes/PumpIt.md) ; `ctx`: [`ResolveCtx`](README.md#resolvectx)  }, ...`deps`: `any`[]) => `any`[] |
