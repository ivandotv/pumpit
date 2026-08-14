---
"pumpit": major
---

Upgrade to TypeScript 7, replace the build toolchain, and tighten the public types.

- Build and type-check on TypeScript `7.0.2`, the native compiler.
- Replace `microbundle` with `tsdown`. Output is smaller (CJS drops from 2974 to
  1810 bytes gzipped, ESM from 1982 to 1770), builds in ~150ms, and emits
  `index.d.cts` natively instead of copying `index.d.ts` over it. `dist` is now
  a single bundled declaration file rather than five loose ones; the package
  entry points are unchanged.
- Drop `typedoc` and the generated `docs/api`. The package ships its own
  declarations with all JSDoc intact, so editor hover and autocomplete remain
  the documentation surface.
- Removed every internal `@ts-expect-error`; the container is now type-correct
  without escape hatches.
- The pool type now matches what is actually stored, so class/factory bindings
  are properly discriminated on `type`.
- New exported types: `ClassConstructor`, `FactoryFn`, `WithInjectProp`,
  `ValidationError`, `ValidationResult`, plus the injection types
  (`Injection`, `InjectionData`, `InjectionFn`, `InjectionOptions`,
  `Injectable`, `ParsedInjectionData`) that already appeared in public
  signatures but could not be imported.
- Fixed a crash in `unbind`/`unbindAll` when a `SINGLETON` binding resolved to a
  primitive: `callDispose` used the `in` operator on the value, which throws a
  `TypeError` for strings and numbers.

Breaking changes. These are type-level rather than runtime, but they can fail a
consumer's build:

- `registerInjections(f, deps)` now takes `InjectionData` instead of `unknown[]`.
- `PumpitError.result` is now `ValidationError[]` instead of `{ key: any; wantedBy: any }[]`.
- The `inject` property on a class/factory is now type-checked.
- The `protected add()` method takes `(key, info)` instead of `(key, value, info)`;
  the third argument was always discarded. Only affects subclasses.

Note for contributors: TypeScript 7 ships no `tsserver`, only `tsc`. Leave your
editor on its bundled TypeScript rather than selecting "Use Workspace Version",
which has nothing to load.
