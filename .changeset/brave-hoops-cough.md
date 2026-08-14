---
"pumpit": major
---

`PumpitError` is now the base class for every error the container throws and its constructor takes an `ErrorCode` instead of a `ValidationError[]`. Validation failures throw `PumpitValidationError`, a subclass that still carries `result`, but whose message now lists the unresolved keys instead of being the literal string `"Validation"`.

`validateSafe` always returns a `ValidationResult` and no longer returns `undefined`.

Injection metadata is read once when a value is bound instead of on every resolve, so `registerInjections` (or assigning `inject` / `INJECT_KEY`) must happen before `bindClass` and `bindFactory`. Later changes are no longer picked up.

Dependencies marked optional are no longer reported by `validate` and `validateSafe`.

`resolve` now infers the return type when the key is a class or a typed token, where it previously widened to `unknown`.

`setParent` accepts `undefined` to detach a parent, and throws when the parent would create a cycle.

Resolving is substantially faster: bound values ~2.5x, cached singletons ~5x, and a small transient graph ~2.4x, mostly by dropping per resolve allocations and parsing injection metadata at bind time.
