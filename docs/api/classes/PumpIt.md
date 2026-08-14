[**pumpit**](../README.md)

***

[pumpit](../README.md) / PumpIt

# Class: PumpIt

Defined in: [src/pumpit.ts:52](https://github.com/ivandotv/pumpit/blob/9d792d0d8e480597323fed14e7e353c726844d12/src/pumpit.ts#L52)

## Constructors

### Constructor

> **new PumpIt**(`name?`): `PumpIt`

Defined in: [src/pumpit.ts:65](https://github.com/ivandotv/pumpit/blob/9d792d0d8e480597323fed14e7e353c726844d12/src/pumpit.ts#L65)

#### Parameters

##### name?

`string`

#### Returns

`PumpIt`

## Methods

### bindClass()

> **bindClass**\<`T`\>(`key`, `value`, `options?`): `this`

Defined in: [src/pumpit.ts:227](https://github.com/ivandotv/pumpit/blob/9d792d0d8e480597323fed14e7e353c726844d12/src/pumpit.ts#L227)

Binds class. Class constructor that is binded will be executed with the "new" call when resolved. Number of executions
depends on the scope used.

#### Type Parameters

##### T

`T` *extends* [`ClassValue`](../type-aliases/ClassValue.md)

#### Parameters

##### key

[`BindKey`](../type-aliases/BindKey.md)

key to resolve binded value [BindKey](../type-aliases/BindKey.md)

##### value

`T`

class to bind

##### options?

`Omit`\<`Partial`\<[`ClassOptions`](../type-aliases/ClassOptions.md)\>, `"type"`\>

bind options for factory [ClassOptions](../type-aliases/ClassOptions.md)

#### Returns

`this`

***

### bindFactory()

> **bindFactory**\<`T`\>(`key`, `value`, `options?`): `this`

Defined in: [src/pumpit.ts:184](https://github.com/ivandotv/pumpit/blob/9d792d0d8e480597323fed14e7e353c726844d12/src/pumpit.ts#L184)

Binds a factory function. Function that is binded will be executed when resolved and the value will be returned.
Number of executions depends on the scope used.

#### Type Parameters

##### T

`T` *extends* [`FactoryValue`](../type-aliases/FactoryValue.md)

#### Parameters

##### key

[`BindKey`](../type-aliases/BindKey.md)

key to resolve binded value [BindKey](../type-aliases/BindKey.md)

##### value

`T`

factory function to bind

##### options?

`Omit`\<`Partial`\<[`FactoryOptions`](../type-aliases/FactoryOptions.md)\>, `"type"`\>

bind options [FactoryOptions](../type-aliases/FactoryOptions.md)

#### Returns

`this`

***

### bindValue()

> **bindValue**\<`T`\>(`key`, `value`): `this`

Defined in: [src/pumpit.ts:166](https://github.com/ivandotv/pumpit/blob/9d792d0d8e480597323fed14e7e353c726844d12/src/pumpit.ts#L166)

Binds value. Value is treated as a singleton and ti will always resolve to the same data (value)

#### Type Parameters

##### T

`T`

#### Parameters

##### key

[`BindKey`](../type-aliases/BindKey.md)

key to resolve binded value [BindKey](../type-aliases/BindKey.md)

##### value

`T`

value to bind

#### Returns

`this`

current pumpIt instance

***

### child()

> **child**(`name?`): `this`

Defined in: [src/pumpit.ts:280](https://github.com/ivandotv/pumpit/blob/9d792d0d8e480597323fed14e7e353c726844d12/src/pumpit.ts#L280)

Creates child PumpIt instance. Child injection instance is connected to the parent instance and it can use
parent singleton values.

#### Parameters

##### name?

`string`

#### Returns

`this`

***

### getName()

> **getName**(): `string` \| `undefined`

Defined in: [src/pumpit.ts:73](https://github.com/ivandotv/pumpit/blob/9d792d0d8e480597323fed14e7e353c726844d12/src/pumpit.ts#L73)

Gets the name of the container

#### Returns

`string` \| `undefined`

The name of the object.

***

### getParent()

> **getParent**(): `PumpIt` \| `undefined`

Defined in: [src/pumpit.ts:299](https://github.com/ivandotv/pumpit/blob/9d792d0d8e480597323fed14e7e353c726844d12/src/pumpit.ts#L299)

Gets parent injector instance

#### Returns

`PumpIt` \| `undefined`

***

### has()

> **has**(`key`, `searchParent?`): `boolean`

Defined in: [src/pumpit.ts:151](https://github.com/ivandotv/pumpit/blob/9d792d0d8e480597323fed14e7e353c726844d12/src/pumpit.ts#L151)

Checks if the dependency under the specified key exists in the container.

#### Parameters

##### key

[`BindKey`](../type-aliases/BindKey.md)

The key to check for existence.

##### searchParent?

`boolean` = `true`

Optional. Specifies whether to search the parent container if the key is not found in the current container. Default is true.

#### Returns

`boolean`

A boolean value indicating whether the key exists in the pool or its parent pool.

***

### isLocked()

> **isLocked**(): `boolean`

Defined in: [src/pumpit.ts:543](https://github.com/ivandotv/pumpit/blob/9d792d0d8e480597323fed14e7e353c726844d12/src/pumpit.ts#L543)

Checks if the container is locked.

#### Returns

`boolean`

`true` if the container is locked, `false` otherwise.

***

### lock()

> **lock**(): `void`

Defined in: [src/pumpit.ts:535](https://github.com/ivandotv/pumpit/blob/9d792d0d8e480597323fed14e7e353c726844d12/src/pumpit.ts#L535)

Locks the container so no more bindings can be added or removed.

#### Returns

`void`

***

### resolve()

> **resolve**\<`T`\>(`key`): `T`

Defined in: [src/pumpit.ts:254](https://github.com/ivandotv/pumpit/blob/9d792d0d8e480597323fed14e7e353c726844d12/src/pumpit.ts#L254)

Resolve value that has previously been binded.

#### Type Parameters

##### T

`T`

value that is going to be resolved

#### Parameters

##### key

[`BindKey`](../type-aliases/BindKey.md)

key to search for [BindKey](../type-aliases/BindKey.md)

#### Returns

`T`

***

### setParent()

> **setParent**(`parent`): `void`

Defined in: [src/pumpit.ts:292](https://github.com/ivandotv/pumpit/blob/9d792d0d8e480597323fed14e7e353c726844d12/src/pumpit.ts#L292)

Sets the parent PumpIt instance.

#### Parameters

##### parent

`PumpIt`

The parent PumpIt instance to be set.

#### Returns

`void`

***

### unbind()

> **unbind**(`key`, `dispose?`): `void`

Defined in: [src/pumpit.ts:95](https://github.com/ivandotv/pumpit/blob/9d792d0d8e480597323fed14e7e353c726844d12/src/pumpit.ts#L95)

Unbinds a dependency from the container.

#### Parameters

##### key

[`BindKey`](../type-aliases/BindKey.md)

The key to unbind.

##### dispose?

`boolean` = `true`

Optional. Specifies whether to call dispose method if available. Default is `true`.

#### Returns

`void`

#### Throws

If the container is locked or if the key is not found.

***

### unbindAll()

> **unbindAll**(`callDispose?`): `void`

Defined in: [src/pumpit.ts:120](https://github.com/ivandotv/pumpit/blob/9d792d0d8e480597323fed14e7e353c726844d12/src/pumpit.ts#L120)

Unbinds all dependencies from the container.

#### Parameters

##### callDispose?

`boolean` = `true`

Whether to call the `dispose` method on each unbound dependency. Default is `true`

#### Returns

`void`

***

### validate()

> **validate**(): `void`

Defined in: [src/pumpit.ts:517](https://github.com/ivandotv/pumpit/blob/9d792d0d8e480597323fed14e7e353c726844d12/src/pumpit.ts#L517)

Validates the bindings in the container.
It will check if all the dependencies that are required by other bindings are present in the container.
If the validation fails it will throw an error.
It will not instantiate the classes or execute the functions.

#### Returns

`void`

***

### validateSafe()

> **validateSafe**(): [`ValidationResult`](../type-aliases/ValidationResult.md) \| `undefined`

Defined in: [src/pumpit.ts:528](https://github.com/ivandotv/pumpit/blob/9d792d0d8e480597323fed14e7e353c726844d12/src/pumpit.ts#L528)

Validates the bindings in the container.
It will check if all the dependencies that are required by other bindings are present in the container.
It will not instantiate the classes or execute the functions.

#### Returns

[`ValidationResult`](../type-aliases/ValidationResult.md) \| `undefined`

An object containing the validation result.
