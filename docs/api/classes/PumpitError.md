[**pumpit**](../README.md)

***

[pumpit](../README.md) / PumpitError

# Class: PumpitError

Defined in: [src/pumpit-error.ts:3](https://github.com/ivandotv/pumpit/blob/9d792d0d8e480597323fed14e7e353c726844d12/src/pumpit-error.ts#L3)

## Extends

- `Error`

## Constructors

### Constructor

> **new PumpitError**(`message`, `result`): `PumpitError`

Defined in: [src/pumpit-error.ts:4](https://github.com/ivandotv/pumpit/blob/9d792d0d8e480597323fed14e7e353c726844d12/src/pumpit-error.ts#L4)

#### Parameters

##### message

`string`

##### result

[`ValidationError`](../type-aliases/ValidationError.md)[]

#### Returns

`PumpitError`

#### Overrides

`Error.constructor`

## Properties

### cause?

> `optional` **cause?**: `unknown`

Defined in: node\_modules/.pnpm/typescript@6.0.3/node\_modules/typescript/lib/lib.es2022.error.d.ts:24

#### Inherited from

`Error.cause`

***

### message

> **message**: `string`

Defined in: node\_modules/.pnpm/typescript@6.0.3/node\_modules/typescript/lib/lib.es5.d.ts:1075

#### Inherited from

`Error.message`

***

### name

> **name**: `string`

Defined in: node\_modules/.pnpm/typescript@6.0.3/node\_modules/typescript/lib/lib.es5.d.ts:1074

#### Inherited from

`Error.name`

***

### result

> **result**: [`ValidationError`](../type-aliases/ValidationError.md)[]

Defined in: [src/pumpit-error.ts:6](https://github.com/ivandotv/pumpit/blob/9d792d0d8e480597323fed14e7e353c726844d12/src/pumpit-error.ts#L6)

***

### stack?

> `optional` **stack?**: `string`

Defined in: node\_modules/.pnpm/typescript@6.0.3/node\_modules/typescript/lib/lib.es5.d.ts:1076

#### Inherited from

`Error.stack`

## Methods

### isError()

> `static` **isError**(`error`): `error is Error`

Defined in: node\_modules/.pnpm/typescript@6.0.3/node\_modules/typescript/lib/lib.esnext.error.d.ts:21

Indicates whether the argument provided is a built-in Error instance or not.

#### Parameters

##### error

`unknown`

#### Returns

`error is Error`

#### Inherited from

`Error.isError`
