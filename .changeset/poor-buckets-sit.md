---
"pumpit": major
---

Remove `beforeResolve` and `afterResolve` callbacks. After some time I figured that these hooks are an **antipattern** when it comes to the dependency injection (and are rarely used), therefore they are being removed.
