---
"pumpit": minor
---

Add typed tokens. `token<T>()` creates a `Symbol` bind key that carries its type, so `resolve` infers the result instead of being told, and bindings made under the token are type checked. `resolve` also infers the instance type when a class is used as the key.

Add `tryResolve`, which returns `undefined` for an unbound key instead of throwing. A missing required dependency of a bound key still throws.

Add `getKeys`, which lists the keys bound on the container, optionally including the parent chain.

Add a `replace` bind option, so a key can be rebound without unbinding it first. The previous binding is unbound, which disposes its cached singleton.

Support `Symbol.dispose` on resolved singletons, preferred over a `dispose` method. The container itself is now disposable, so `using container = new PumpIt()` unbinds everything on scope exit.

Every error thrown by the container is now a `PumpitError` carrying a machine readable `code`, exported as `ERROR_CODE`.
