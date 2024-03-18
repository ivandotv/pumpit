# pumpa

## 7.1.0

### Minor Changes

- c470983: Optionally give instances custom names.

## 7.0.2

### Patch Changes

- c7e4157: ts config import issue

## 7.0.1

### Patch Changes

- 516e684: run biome check on all source files

## 7.0.0

### Major Changes

- e2c941d: refactor package export fields to include separate require statements.

  closes Support --moduleResolution node16 in typescript #38

  more info on the problem:
  https://github.com/arethetypeswrong/arethetypeswrong.github.io/blob/main/docs/problems/FalseESM.md

## 6.0.1

### Patch Changes

- 27f4119: update readme
- fd2f690: add class inheritance documentation
- 0a3e663: mark package side effects free

## 6.0.0

### Major Changes

- 073c0b8: remove circular dependency functionality
- e92fde3: remove the possibility to inject dependency as array of dependencies

## 5.0.0

### Major Changes

- 4324109: switch to vite build process

## 4.1.1

### Patch Changes

- af829ec: update readme

## 4.1.0

### Minor Changes

- 6fb62fa: Remove bind key check. This will not check if the bind keys passed to the `bindFactory` are correct.
- 5669230: Implement `postConstruct` method that will be automatically called if it exists on the class.

## 4.0.4

### Patch Changes

- cb7c7b7: fix unbind falsy values

## 4.0.3

### Patch Changes

- 0bbcf2c: fix: Singleton values are not properly resolved on multiple resolve calls.

## 4.0.2

### Patch Changes

- fef839d: update docs

## 4.0.1

### Patch Changes

- 0e346fb: chore: update README

## 4.0.0

### Major Changes

- 5eef060: Change method name
- a20b69b: Implement `clearSingleton` method.

  It enables clearing a single singleton by key.

- 1d024dc: Rename methods.
  `clearAllSingletons` is renamed to `clearAllInstances`
  `clearSingleton` is renamed to `clearInstance`
- 42309c6: Introduce new scope: `SCOPE.CONTAINER_SINGLETON`. This is similar to regular `singleton` scope, but if a child container is made, that child container will resolve an instance unique to it.

  Remove "`shareSingletons`" option from `child` method. This is no longer needed since the new `SCOPE.CONTAINER_SINGLETON` replaces this functionality.

## 3.0.0

### Major Changes

- 3e372cb: Change function signature for "beforeResolve function"
- ec70e5a: Change function signature for "onBefore"

## 2.0.0

### Major Changes

- 84c44d2: Implement object value registration for class and factory binding.

## 1.0.0

### Major Changes

- bbb3f6b: Rename all the files and code from "Pumpa" to "PumpIt", since NPM doesn't allow
  me to use "Pumpa" as it is too similar to "pump" package.

## 0.1.0

### Minor Changes

- 2af26f2: Add option for custom data to be passed to the `beforeResolve` and `afterResolve` callbacks.
