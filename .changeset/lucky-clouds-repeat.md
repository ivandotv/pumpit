---
"pumpit": patch
---

Fix the shipped declarations referencing the global `Disposable` type. `PumpIt` is disposable, and the emitted `.d.ts` said so with `interface PumpIt extends Disposable {}`, but `Disposable` is only declared by `lib: esnext.disposable`. A consumer on an older `lib` without `skipLibCheck` got `TS2304: Cannot find name 'Disposable'` from inside `node_modules`. The dispose method is now described structurally off `SymbolConstructor`, which every `lib` declares, so the declarations are self-contained: `using container = new PumpIt()` still type checks where `Symbol.dispose` exists, and degrades to an empty type instead of an error where it does not.

Drop the dangling `sourceMappingURL` comment from `index.d.ts` and `index.d.cts`. tsdown passes the top level `sourcemap` option to the declaration build as well, which appended a reference to `index.d.ts.map` that was never emitted. The JavaScript source maps are unchanged.
