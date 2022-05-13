[pumpit](../README.md) / Pumpa

# Class: Pumpa

## Table of contents

### Constructors

- [constructor](Pumpa.md#constructor)

### Methods

- [bindClass](Pumpa.md#bindclass)
- [bindFactory](Pumpa.md#bindfactory)
- [bindValue](Pumpa.md#bindvalue)
- [child](Pumpa.md#child)
- [clearInstances](Pumpa.md#clearinstances)
- [getParent](Pumpa.md#getparent)
- [has](Pumpa.md#has)
- [resolve](Pumpa.md#resolve)
- [unbind](Pumpa.md#unbind)
- [unbindAll](Pumpa.md#unbindall)

## Constructors

### constructor

• **new Pumpa**()

## Methods

### bindClass

▸ **bindClass**<`T`\>(`key`, `value`, `options?`): [`Pumpa`](Pumpa.md)

Binds class. Class constructor that is binded will be executed with the "new" call when resolved. Number of executions
depends on the scope used.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends (...`args`: `any`[]) => `any` = (...`args`: `any`[]) => `any` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `key` | [`BindKey`](../README.md#bindkey) | key to resolve binded value [BindKey](../README.md#bindkey) |
| `value` | `T` | class to bind |
| `options?` | `Omit`<`Partial`<[`ClassOptions`](../README.md#classoptions)<`T`, ``"SINGLETON"`` \| ``"TRANSIENT"`` \| ``"REQUEST"``\>\>, ``"type"``\> | bind options for factory [ClassOptions](../README.md#classoptions) |

#### Returns

[`Pumpa`](Pumpa.md)

#### Defined in

[pumpa.ts:170](https://github.com/ivandotv/pumpa/blob/e80963d/src/pumpa.ts#L170)

___

### bindFactory

▸ **bindFactory**<`T`\>(`key`, `value`, `options?`): [`Pumpa`](Pumpa.md)

Binds a factory function. Function that is binded will be executed when resolved and the value will be returned.
Number of executions dependes on the scope used.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends (...`args`: `any`[]) => `any` = (...`args`: `any`[]) => `any` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `key` | [`BindKey`](../README.md#bindkey) | key to resolve binded value [BindKey](../README.md#bindkey) |
| `value` | `T` | factory function to bind |
| `options?` | `Omit`<`Partial`<[`FactoryOptions`](../README.md#factoryoptions)<`T`, ``"SINGLETON"`` \| ``"TRANSIENT"`` \| ``"REQUEST"``\>\>, ``"type"``\> | bind options [FactoryOptions](../README.md#factoryoptions) |

#### Returns

[`Pumpa`](Pumpa.md)

#### Defined in

[pumpa.ts:146](https://github.com/ivandotv/pumpa/blob/e80963d/src/pumpa.ts#L146)

___

### bindValue

▸ **bindValue**(`key`, `value`): [`Pumpa`](Pumpa.md)

Binds value. Value is treated as a singleton and ti will always resolve to the same data (value)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `key` | [`BindKey`](../README.md#bindkey) | key to resolve binded value [BindKey](../README.md#bindkey) |
| `value` | `any` | value to bind |

#### Returns

[`Pumpa`](Pumpa.md)

current pumpa instance

#### Defined in

[pumpa.ts:128](https://github.com/ivandotv/pumpa/blob/e80963d/src/pumpa.ts#L128)

___

### child

▸ **child**(`options?`): [`Pumpa`](Pumpa.md)

Creates child Pumpa instance. Child injection instance is connected to the parent instance and it can use
parent singleton values.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options` | [`ChildOptions`](../README.md#childoptions) | child injector options [ChildOptions](../README.md#childoptions) |

#### Returns

[`Pumpa`](Pumpa.md)

#### Defined in

[pumpa.ts:233](https://github.com/ivandotv/pumpa/blob/e80963d/src/pumpa.ts#L233)

___

### clearInstances

▸ **clearInstances**(): `void`

#### Returns

`void`

#### Defined in

[pumpa.ts:96](https://github.com/ivandotv/pumpa/blob/e80963d/src/pumpa.ts#L96)

___

### getParent

▸ **getParent**(): `undefined` \| [`Pumpa`](Pumpa.md)

Gets parent injector instance

#### Returns

`undefined` \| [`Pumpa`](Pumpa.md)

#### Defined in

[pumpa.ts:244](https://github.com/ivandotv/pumpa/blob/e80963d/src/pumpa.ts#L244)

___

### has

▸ **has**(`key`, `searchParent?`): `boolean`

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `key` | [`BindKey`](../README.md#bindkey) | `undefined` |
| `searchParent` | `boolean` | `true` |

#### Returns

`boolean`

#### Defined in

[pumpa.ts:113](https://github.com/ivandotv/pumpa/blob/e80963d/src/pumpa.ts#L113)

___

### resolve

▸ **resolve**<`T`\>(`key`, `opts?`): `T`

Resolve value that has previously been binded.

#### Type parameters

| Name | Description |
| :------ | :------ |
| `T` | value that is going to be resolved |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `key` | [`BindKey`](../README.md#bindkey) | key to search for [BindKey](../README.md#bindkey) |
| `opts?` | [`ResolveCtx`](../README.md#resolvectx) | options for the current resolve request [ResolveCtx](../README.md#resolvectx) |

#### Returns

`T`

#### Defined in

[pumpa.ts:195](https://github.com/ivandotv/pumpa/blob/e80963d/src/pumpa.ts#L195)

___

### unbind

▸ **unbind**(`key`, `dispose?`): `void`

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `key` | [`BindKey`](../README.md#bindkey) | `undefined` |
| `dispose` | `boolean` | `true` |

#### Returns

`void`

#### Defined in

[pumpa.ts:62](https://github.com/ivandotv/pumpa/blob/e80963d/src/pumpa.ts#L62)

___

### unbindAll

▸ **unbindAll**(`callDispose?`): `void`

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `callDispose` | `boolean` | `true` |

#### Returns

`void`

#### Defined in

[pumpa.ts:88](https://github.com/ivandotv/pumpa/blob/e80963d/src/pumpa.ts#L88)
