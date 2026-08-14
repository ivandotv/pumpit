---
"pumpit": minor
---

Upgrade to TypeScript 6 and tighten the public types.

- Build and type-check on TypeScript `6.0.3` (see note on TypeScript 7 below).
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

Potentially breaking for some consumers, despite being a types-only change:

- `registerInjections(f, deps)` now takes `InjectionData` instead of `unknown[]`.
- `PumpitError.result` is now `ValidationError[]` instead of `{ key: any; wantedBy: any }[]`.
- The `inject` property on a class/factory is now type-checked.
- The `protected add()` method takes `(key, info)` instead of `(key, value, info)`;
  the third argument was always discarded. Only affects subclasses.

Note: TypeScript 7 (the native compiler) is intentionally not used yet. It ships
no JS compiler API, which `microbundle` (via `rollup-plugin-typescript2`) and
`typedoc` both depend on, so the build and docs pipelines cannot run on it until
those tools are replaced.
