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

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`ClassValue`](../README.md#classvalue) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | [`BindKey`](../README.md#bindkey) |
| `value` | `T` |
| `options?` | `Omit`<`Partial`<[`ClassOptions`](../README.md#classoptions)<`T`, ``"SINGLETON"`` \| ``"TRANSIENT"`` \| ``"REQUEST"`` \| ``"CONTAINER_SINGLETON"``\>\>, ``"type"``\> |

#### Returns

[`PumpIt`](PumpIt.md)

___

### bindFactory

▸ **bindFactory**<`T`\>(`key`, `value`, `options?`): [`PumpIt`](PumpIt.md)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`FactoryValue`](../README.md#factoryvalue) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | [`BindKey`](../README.md#bindkey) |
| `value` | `T` |
| `options?` | `Omit`<`Partial`<[`FactoryOptions`](../README.md#factoryoptions)<`T`, ``"SINGLETON"`` \| ``"TRANSIENT"`` \| ``"REQUEST"`` \| ``"CONTAINER_SINGLETON"``\>\>, ``"type"``\> |

#### Returns

[`PumpIt`](PumpIt.md)

___

### bindValue

▸ **bindValue**<`T`\>(`key`, `value`): [`PumpIt`](PumpIt.md)

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | [`BindKey`](../README.md#bindkey) |
| `value` | `T` |

#### Returns

[`PumpIt`](PumpIt.md)

___

### child

▸ **child**(): [`PumpIt`](PumpIt.md)

#### Returns

[`PumpIt`](PumpIt.md)

___

### clearAllInstances

▸ **clearAllInstances**(): `void`

#### Returns

`void`

___

### clearInstance

▸ **clearInstance**(`key`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | [`BindKey`](../README.md#bindkey) |

#### Returns

`boolean`

___

### getParent

▸ **getParent**(): `undefined` \| [`PumpIt`](PumpIt.md)

#### Returns

`undefined` \| [`PumpIt`](PumpIt.md)

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

___

### resolve

▸ **resolve**<`T`\>(`key`, `opts?`): `T`

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | [`BindKey`](../README.md#bindkey) |
| `opts?` | [`ResolveCtx`](../README.md#resolvectx) |

#### Returns

`T`

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

___

### unbindAll

▸ **unbindAll**(`callDispose?`): `void`

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `callDispose` | `boolean` | `true` |

#### Returns

`void`
