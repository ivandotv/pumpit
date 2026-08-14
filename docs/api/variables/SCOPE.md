[**pumpit**](../README.md)

***

[pumpit](../README.md) / SCOPE

# Variable: SCOPE

> `const` **SCOPE**: `object`

Defined in: [src/pumpit.ts:41](https://github.com/ivandotv/pumpit/blob/9d792d0d8e480597323fed14e7e353c726844d12/src/pumpit.ts#L41)

Constants that represent the type of scopes that can be used
SINGLETON - value is resolved only once
TRANSIENT - value is resolved everytime it is requested
REQUEST - value is resolved once per resolve method call [PumpIt.resolve()](../classes/PumpIt.md#resolve)
CONTAINER_SINGLETON - the child container will create it's own version of the singleton instance

## Type Declaration

### CONTAINER\_SINGLETON

> `readonly` **CONTAINER\_SINGLETON**: `"CONTAINER_SINGLETON"` = `"CONTAINER_SINGLETON"`

CONTAINER_SINGLETON - the child container will create it's own version of the singleton instance

### REQUEST

> `readonly` **REQUEST**: `"REQUEST"` = `"REQUEST"`

REQUEST - value is resolved once per resolve method call [PumpIt.resolve()](../classes/PumpIt.md#resolve)

### SINGLETON

> `readonly` **SINGLETON**: `"SINGLETON"` = `"SINGLETON"`

SINGLETON - value is resolved only once

### TRANSIENT

> `readonly` **TRANSIENT**: `"TRANSIENT"` = `"TRANSIENT"`

TRANSIENT - value is resolved everytime it is requested
