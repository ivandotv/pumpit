[pumpit](../README.md) / PumpIt

# Class: PumpIt

## Table of contents

### Constructors

- [constructor](PumpIt.md#constructor)

### Methods

- [bindClass](PumpIt.md#bindclass)
- [bindFactory](PumpIt.md#bindfactory)
- [bindValue](PumpIt.md#bindvalue)
- [child](PumpIt.md#child)
- [clearAllInstances](PumpIt.md#clearallinstances)
- [clearInstance](PumpIt.md#clearinstance)
- [getParent](PumpIt.md#getparent)
- [has](PumpIt.md#has)
- [resolve](PumpIt.md#resolve)
- [unbind](PumpIt.md#unbind)
- [unbindAll](PumpIt.md#unbindall)

## Constructors

### constructor

• **new PumpIt**()

## Methods

### bindClass

▸ **bindClass**<`T`\>(`key`, `value`, `options?`): [`PumpIt`](PumpIt.md)

Binds class. Class constructor that is binded will be executed with the "new" call when resolved. Number of executions
depends on the scope used.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`ClassValue`](../README.md#classvalue) |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `key` | [`BindKey`](../README.md#bindkey) | key to resolve binded value [BindKey](../README.md#bindkey) |
| `value` | `T` | class to bind |
| `options?` | `Omit`<`Partial`<[`ClassOptions`](../README.md#classoptions)<`T`, ``"SINGLETON"`` \| ``"TRANSIENT"`` \| ``"REQUEST"`` \| ``"CONTAINER_SINGLETON"``\>\>, ``"type"``\> | bind options for factory [ClassOptions](../README.md#classoptions) |

#### Returns

[`PumpIt`](PumpIt.md)

#### Defined in

[pumpit.ts:212](https://github.com/ivandotv/pumpit/blob/9a6ed9d/src/pumpit.ts#L212)

___

### bindFactory

▸ **bindFactory**<`T`\>(`key`, `value`, `options?`): [`PumpIt`](PumpIt.md)

Binds a factory function. Function that is binded will be executed when resolved and the value will be returned.
Number of executions depends on the scope used.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`FactoryValue`](../README.md#factoryvalue) |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `key` | [`BindKey`](../README.md#bindkey) | key to resolve binded value [BindKey](../README.md#bindkey) |
| `value` | `T` | factory function to bind |
| `options?` | `Omit`<`Partial`<[`FactoryOptions`](../README.md#factoryoptions)<`T`, ``"SINGLETON"`` \| ``"TRANSIENT"`` \| ``"REQUEST"`` \| ``"CONTAINER_SINGLETON"``\>\>, ``"type"``\> | bind options [FactoryOptions](../README.md#factoryoptions) |

#### Returns

[`PumpIt`](PumpIt.md)

#### Defined in

[pumpit.ts:160](https://github.com/ivandotv/pumpit/blob/9a6ed9d/src/pumpit.ts#L160)

___

### bindValue

▸ **bindValue**<`T`\>(`key`, `value`): [`PumpIt`](PumpIt.md)

Binds value. Value is treated as a singleton and ti will always resolve to the same data (value)

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `key` | [`BindKey`](../README.md#bindkey) | key to resolve binded value [BindKey](../README.md#bindkey) |
| `value` | `T` | value to bind |

#### Returns

[`PumpIt`](PumpIt.md)

current pumpIt instance

#### Defined in

[pumpit.ts:142](https://github.com/ivandotv/pumpit/blob/9a6ed9d/src/pumpit.ts#L142)

___

### child

▸ **child**(): [`PumpIt`](PumpIt.md)

Creates child PumpIt instance. Child injection instance is connected to the parent instance and it can use
parent singleton values.

#### Returns

[`PumpIt`](PumpIt.md)

#### Defined in

[pumpit.ts:286](https://github.com/ivandotv/pumpit/blob/9a6ed9d/src/pumpit.ts#L286)

___

### clearAllInstances

▸ **clearAllInstances**(): `void`

#### Returns

`void`

#### Defined in

[pumpit.ts:98](https://github.com/ivandotv/pumpit/blob/9a6ed9d/src/pumpit.ts#L98)

___

### clearInstance

▸ **clearInstance**(`key`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | [`BindKey`](../README.md#bindkey) |

#### Returns

`boolean`

#### Defined in

[pumpit.ts:105](https://github.com/ivandotv/pumpit/blob/9a6ed9d/src/pumpit.ts#L105)

___

### getParent

▸ **getParent**(): `undefined` \| [`PumpIt`](PumpIt.md)

Gets parent injector instance

#### Returns

`undefined` \| [`PumpIt`](PumpIt.md)

#### Defined in

[pumpit.ts:296](https://github.com/ivandotv/pumpit/blob/9a6ed9d/src/pumpit.ts#L296)

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

[pumpit.ts:127](https://github.com/ivandotv/pumpit/blob/9a6ed9d/src/pumpit.ts#L127)

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

[pumpit.ts:243](https://github.com/ivandotv/pumpit/blob/9a6ed9d/src/pumpit.ts#L243)

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

[pumpit.ts:62](https://github.com/ivandotv/pumpit/blob/9a6ed9d/src/pumpit.ts#L62)

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

[pumpit.ts:90](https://github.com/ivandotv/pumpit/blob/9a6ed9d/src/pumpit.ts#L90)
