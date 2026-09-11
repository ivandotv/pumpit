---
"pumpit": patch
---

Fix child containers returning stale `CONTAINER_SINGLETON` instances after a
key is shadowed, the parent changes, or an inherited binding is replaced.
Child-owned inherited instances are now disposed with the child as well.

Add release checks for the packed files, ESM and CommonJS runtime exports, and
consumer compilation against both declaration formats.
