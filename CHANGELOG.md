# pumpa

## 11.0.0

### Major Changes

- 72d5ed5: `PumpitError` is now the base class for every error the container throws and its constructor takes an `ErrorCode` instead of a `ValidationError[]`. Validation failures throw `PumpitValidationError`, a subclass that still carries `result`, but whose message now lists the unresolved keys instead of being the literal string `"Validation"`.

  `validateSafe` always returns a `ValidationResult` and no longer returns `undefined`.

  Injection metadata is read once when a value is bound instead of on every resolve, so `registerInjections` (or assigning `inject` / `INJECT_KEY`) must happen before `bindClass` and `bindFactory`. Later changes are no longer picked up.

  Dependencies marked optional are no longer reported by `validate` and `validateSafe`.

  `resolve` now infers the return type when the key is a class or a typed token, where it previously widened to `unknown`.

  `setParent` accepts `undefined` to detach a parent, and throws when the parent would create a cycle.

  Resolving is substantially faster: bound values ~2.5x, cached singletons ~5x, and a small transient graph ~2.4x, mostly by dropping per resolve allocations and parsing injection metadata at bind time.

- ae34601: Stricter type definitions, which can fail a build that previously compiled. `registerInjections` now takes `InjectionData` instead of `unknown[]`, `PumpitError.result` is `ValidationError[]` instead of `any`, and the `inject` property on a class or factory is type checked. The protected `add` method drops its second argument, which was always discarded.

  Also fixes `unbind` and `unbindAll` throwing a `TypeError` when a `SINGLETON` binding resolved to a string or number, and exports the types that already appeared in public signatures but could not be imported: `ClassConstructor`, `FactoryFn`, `WithInjectProp`, `ValidationError`, `ValidationResult`, `Injection`, `InjectionData`, `InjectionFn`, `InjectionOptions`, `Injectable` and `ParsedInjectionData`.

### Minor Changes

- 72d5ed5: Add typed tokens. `token<T>()` creates a `Symbol` bind key that carries its type, so `resolve` infers the result instead of being told, and bindings made under the token are type checked. `resolve` also infers the instance type when a class is used as the key.

  Add `tryResolve`, which returns `undefined` for an unbound key instead of throwing. A missing required dependency of a bound key still throws.

  Add `getKeys`, which lists the keys bound on the container, optionally including the parent chain.

  Add a `replace` bind option, so a key can be rebound without unbinding it first. The previous binding is unbound, which disposes its cached singleton.

  Support `Symbol.dispose` on resolved singletons, preferred over a `dispose` method. The container itself is now disposable, so `using container = new PumpIt()` unbinds everything on scope exit. Disposal ignores the lock, since throwing out of a disposal would mask whatever the enclosing block was doing. `unbindAll` still refuses a locked container.

  Every error thrown by the container is now a `PumpitError` carrying a machine readable `code`, exported as `ERROR_CODE`.

### Patch Changes

- 72d5ed5: Fix bindings that resolve to `undefined` leaking an internal symbol. A `SINGLETON` or `REQUEST` binding whose class or factory produced `undefined` returned that sentinel on the first resolve, and injected it into every dependent afterwards.

  Fix `validate` and `validateSafe` silently giving up. Reaching a binding that an earlier binding already listed as a dependency aborted the whole check, so `validate` did not throw and `validateSafe` returned `undefined`. Missing dependencies are now reported regardless of bind order, and optional dependencies are no longer reported at all.

  Fix resolution that crosses into a parent container starting a fresh request. A `SINGLETON` owned by a parent used to be resolved through a brand new context, which split `REQUEST` scope into two instances within a single `resolve` call, ran `postConstruct` hooks before the outer graph finished building, and hid circular references behind a stack overflow.

  Fix `setParent` accepting a parent that creates a cycle in the hierarchy, which turned every lookup into infinite recursion.

  Fix `unbindAll` succeeding on a locked container when the container was empty.

  Circular reference errors now report the full resolution path with the bound class names, instead of stringifying an internal wrapper function.

## 10.1.0

### Minor Changes

- 545de07: add `setParent` method.
  Child container can set parent container connection

## 10.0.0

### Major Changes

- c9b67ea: remove resolve method second parameter (options - context)

## 9.0.0

### Major Changes

- f814cd6: Remove `beforeResolve` and `afterResolve` callbacks. After some time I figured that these hooks are an **antipattern** when it comes to the dependency injection (and are rarely used), therefore they are being removed.
- 634db4a: remove `unbind` hook. After some time I have found that the unbind hook is an antipattern and I do not want to support it anymore.
- 867d760: remove `transform` utility function. Another anti-pattern.

## 8.0.0

### Major Changes

- 076812a: remove `clearInstance` and `clearAllInstances` methods.

### Minor Changes

- 9390bf1: create `registerInjections` helper function for an easier way to register dependencies for a class or a function
- 03e55af: Add container `lock` method.

### Patch Changes

- 6ba17d1: add comments to public methods

## 7.3.1

### Patch Changes

- 509c64d: Add documentation for the `validate` and `validateSafe` methods.

## 7.3.0

### Minor Changes

- c72533b: This PR implements two new methods on the pumpit class validate and validateSafe. These methods check if dependency keys that are used for injection are present in the container. It will not instantiate any classes or run factory functions.
  The `validate` method will throw an error if the tree is invalid, while the `validateSafe` method will return an object indicating whether the tree is valid.

## 7.2.0

### Minor Changes

- 4cfbc46: Implement using special "INJECT_KEY" symbol instead of "inject" key property

## 7.1.1

### Patch Changes

- 61a361f: instances created via "child" method can also have a name

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
