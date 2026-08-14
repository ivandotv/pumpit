---
"pumpit": major
---

Stricter type definitions, which can fail a build that previously compiled. `registerInjections` now takes `InjectionData` instead of `unknown[]`, `PumpitError.result` is `ValidationError[]` instead of `any`, and the `inject` property on a class or factory is type checked. The protected `add` method drops its second argument, which was always discarded.

Also fixes `unbind` and `unbindAll` throwing a `TypeError` when a `SINGLETON` binding resolved to a string or number, and exports the types that already appeared in public signatures but could not be imported: `ClassConstructor`, `FactoryFn`, `WithInjectProp`, `ValidationError`, `ValidationResult`, `Injection`, `InjectionData`, `InjectionFn`, `InjectionOptions`, `Injectable` and `ParsedInjectionData`.
