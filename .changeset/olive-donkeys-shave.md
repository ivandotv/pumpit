---
"pumpit": patch
---

Fix bindings that resolve to `undefined` leaking an internal symbol. A `SINGLETON` or `REQUEST` binding whose class or factory produced `undefined` returned that sentinel on the first resolve, and injected it into every dependent afterwards.

Fix `validate` and `validateSafe` silently giving up. Reaching a binding that an earlier binding already listed as a dependency aborted the whole check, so `validate` did not throw and `validateSafe` returned `undefined`. Missing dependencies are now reported regardless of bind order, and optional dependencies are no longer reported at all.

Fix resolution that crosses into a parent container starting a fresh request. A `SINGLETON` owned by a parent used to be resolved through a brand new context, which split `REQUEST` scope into two instances within a single `resolve` call, ran `postConstruct` hooks before the outer graph finished building, and hid circular references behind a stack overflow.

Fix `setParent` accepting a parent that creates a cycle in the hierarchy, which turned every lookup into infinite recursion.

Fix `unbindAll` succeeding on a locked container when the container was empty.

Circular reference errors now report the full resolution path with the bound class names, instead of stringifying an internal wrapper function.
