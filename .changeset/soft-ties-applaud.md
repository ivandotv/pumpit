---
"pumpit": minor
---

This PR implements two new methods on the pumpit class validate and validateSafe. These methods check if dependency keys that are used for injection are present in the container. It will not instantiate any classes or run factory functions.
The `validate` method will throw an error if the tree is invalid, while the `validateSafe` method will return an object indicating whether the tree is valid.
