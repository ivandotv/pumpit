[**pumpit**](../README.md)

***

[pumpit](../README.md) / ValidationError

# Type Alias: ValidationError

> **ValidationError** = `object`

Defined in: [src/types.ts:57](https://github.com/ivandotv/pumpit/blob/9d792d0d8e480597323fed14e7e353c726844d12/src/types.ts#L57)

A single unresolved dependency reported by the container validation

## Properties

### key

> **key**: [`BindKey`](BindKey.md)

Defined in: [src/types.ts:59](https://github.com/ivandotv/pumpit/blob/9d792d0d8e480597323fed14e7e353c726844d12/src/types.ts#L59)

The key that could not be found in the container

***

### wantedBy

> **wantedBy**: [`BindKey`](BindKey.md)[]

Defined in: [src/types.ts:61](https://github.com/ivandotv/pumpit/blob/9d792d0d8e480597323fed14e7e353c726844d12/src/types.ts#L61)

The keys that declare a dependency on [ValidationError.key](#key)
