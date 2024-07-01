# PumpIt

[![Test](https://github.com/ivandotv/pumpit/actions/workflows/CI.yml/badge.svg)](https://github.com/ivandotv/pumpit/actions/workflows/CI.yml)
[![Codecov](https://img.shields.io/codecov/c/gh/ivandotv/pumpit)](https://app.codecov.io/gh/ivandotv/pumpit)
[![GitHub license](https://img.shields.io/github/license/ivandotv/pumpit)](https://github.com/ivandotv/pumpit/blob/main/LICENSE)

`PumpIt` is a small [(~2KB)](https://bundlephobia.com/package/pumpit) dependency injection container without the decorators and zero dependencies, suitable for the browser.
It supports different injection scopes, child containers, hooks etc...

<!-- toc -->

- [Motivation](#motivation)
- [Getting Started](#getting-started)
  * [Registering classes](#registering-classes)
    + [Class injection inheritance](#class-injection-inheritance)
      - [Combining injection dependencies](#combining-injection-dependencies)
  * [Registering factories](#registering-factories)
  * [Registering values](#registering-values)
- [Resolving container data](#resolving-container-data)
  * [Resolve context](#resolve-context)
- [Injection tokens](#injection-tokens)
- [Injection scopes](#injection-scopes)
  * [Singleton](#singleton)
  * [Transient](#transient)
  * [Request](#request)
  * [Container singleton](#container-singleton)
- [Optional injections](#optional-injections)
- [~~Circular dependencies~~](#circular-dependencies)
- [~~Injecting arrays~~](#injecting-arrays)
  * [Transforming injected dependencies](#transforming-injected-dependencies)
  * [Post construct method](#post-construct-method)
- [Removing values from the container](#removing-values-from-the-container)
  * [Calling the dispose method](#calling-the-dispose-method)
  * [Dispose callback](#dispose-callback)
  * [Removing all the values from the container](#removing-all-the-values-from-the-container)
  * [Locking the container](#locking-the-container)
- [Child containers](#child-containers)
  * [Shadowing values](#shadowing-values)
  * [Checking for values](#checking-for-values)
  * [Child singletons](#child-singletons)
  * [Validating bindings](#validating-bindings)
- [Helpers](#helpers)
  * [Register injections](#register-injections)
- [API docs](#api-docs)
- [License](#license)

<!-- tocstop -->

## Motivation

Dependency injection is a powerful concept, and there are some excellent solutions like [tsyringe](https://github.com/microsoft/tsyringe), [awilix](https://github.com/jeffijoe/awilix), and [inversify](https://github.com/inversify/InversifyJS), however, they all use decorators (which are great, but not a standard), and their file size is not suitable for front-end development. So I've decided to create an implementation of a dependency injection container that is small and doesn't use decorators. I also believe that I've covered all the functionality of the above-mentioned libraries.

## Getting Started

Installation:

```sh
npm i pumpit
```

Since `PumpIt` does not rely on the decorators the injection is done via the `injection` property. When used with `classes`, `inject` will be a static property on the class, and it will hold an array of registered injection `tokens` that will be injected into the constructor in the same order when the class instance is created (in case of factory functions it will be a property on the function itself, more on that [later](#registering-factories)).

### Registering classes

```ts
import { PumpIt } from 'pumpit'

const container = new PumpIt()
const bindKeyB = 'b'

class TestA {
  static inject = [bindKeyB]

  constructor(b: B) {}
}

class TestB {}

// bind (register)  classes to the injection container.
container.bindClass(TestA, TestA).bindClass(bindKeyB, TestB)

//resolve values
const instanceA = container.resolve<TestA>(TestA)
const instanceB = container.resolve<TestA>(bindKeyB)

instanceA.b // injected B instance
```

There is also alternative syntax that you can use when you don't want to use the static `inject` property, or you are importing a class from third-party packages.

```ts
import { PumpIt } from 'pumpit'

const container = new PumpIt()
class TestA {
  constructor(b: TestB) {}
}

class TestB {}

//`bind`(register)  class to the injection container.
container.bindClass(TestA, { value: TestA, inject: [TestB] })
//or
container.bindClass('some_key_to_bind', { value: TestA, inject: [TestB] })
```

You can also use a special `INJECT_KEY` value (which is actually a `Symbol`) to inject the dependencies, this also helps when you can't use
a static `inject` property on a class (maybe the property already exists or it's a third party class)

```ts
import { PumpIt, INJECT_KEY } from 'pumpit'

const container = new PumpIt()

class TestB {}

class TestA {
  static [INJECT_KEY] = [TestB]
  constructor(b: TestB) {}
}

//or you can also use this
TestA[INJECT_KEY] = [TestB]

container.bindClass(TestA,TestA)
container.bindClass(TestB,TestB)

```


#### Class injection inheritance

Class injection inheritance is supported out of the box, which means that the child class will get dependencies that are set to be injected to the parent.

```ts
const pumpIt = new PumpIt()

class TestB {}

class TestA {
  static inject = [TestB]
}

class TestC extends TestA {
  //TestB will be injected by reading `inject` array from the parent (TestA)
  constructor(public b: TestB) {
    super()
  }
}

pumpIt.bindClass(TestA, TestA)
pumpIt.bindClass(TestB, TestB)
pumpIt.bindClass(TestC, TestC)

const instance = pumpIt.resolve<TestC>(TestC)

expect(instance.b).toBeInstanceOf(TestB)
```

##### Combining injection dependencies

Child class can define their own dependencies and combine them with the parent dependencies.

```ts
class TestB {}
class TestD {}

class TestA {
  static inject = [TestB]

  constructor(public b: TestB) {}
}

class TestC extends TestA {
  // use dependencies from the parent and add your own (TestD class)
  static inject = [...TestA.inject, TestD]

  constructor(
    public b: TestB,
    public d: TestD
  ) {
    super()
  }
}

pumpIt.bindClass(TestA, TestA)
pumpIt.bindClass(TestB, TestB)
pumpIt.bindClass(TestC, TestC)
pumpIt.bindClass(TestD, TestD)

const instance = pumpIt.resolve<TestC>(TestC)

expect(instance.b).toBeInstanceOf(TestB)
expect(instance.d).toBeInstanceOf(TestD)
```

### Registering factories

When registering function factories, `function` needs to be provided as the value, and when that `value` is requested,
the function will be executed and returned result will be the value that will be injected where it is needed.

```ts
const container = new PumpIt()

const myFactory = () => 'hello world'

container.bindFactory(myFactory, myFactory)

const value: string = container.resolve(myFactory)

value === 'hello world'
```

Factories can also have dependencies injected. They will be passed as the arguments to the factory function when it is executed.

```ts
const container = new PumpIt()
class A {
  hello() {
    return 'hello from A'
  }
}

const myFactory = (a: A) => {
  return a.hello()
}
myFactory.inject = [A]

container.bindClass(A, A)
container.bindFactory(myFactory, myFactory)

const value: string = container.resolve(myFactory) //hello from A
```

Or alternative syntax (same as `class` alternative syntax):

```ts
const container = new PumpIt()

class A {
  hello() {
    return 'hello from A'
  }
}

const myFactory = (a: A) => {
  return a.hello()
}

container.bindClass(A, A)
container.bindFactory(myFactory, { value: myFactory, inject: [A] })

const value: string = container.resolve(myFactory)
value === 'hello from A'
```

You can also use a special `INJECT_KEY` value (which is actually a `Symbol`) to inject the dependencies. This is not that much useful when
working with factories, but it can be [very useful when working with classes](#registering-classes)

```ts
import { PumpIt, INJECT_KEY } from 'pumpit'

const container = new PumpIt()
class A {
  hello() {
    return 'hello from A'
  }
}

const myFactory = (a: A) => {
  return a.hello()
}

myFactory[INJECT_KEY] = [A]

container.bindClass(A, A)
container.bindFactory(myFactory, myFactory)

const value: string = container.resolve(myFactory) //hello from A
```

I encourage you to experiment with factories because they enable you to return anything you want.

### Registering values

Values should be used when you just want to get back the same thing that is passed in to be registered.

```ts
const container = new PumpIt()

const myConfig = { foo: 'bar' }

container.bindValue('app_config', myConfig)

const resolvedConfig = container.resolve('app_config')

resolvedConfig === myConfig
```

## Resolving container data

When the container data is resolved, if the key that is requested to be resolved is not found, the container will throw an error.

```ts
const container = new PumpIt()

container.resolve('key_does_not_exist') // will throw
```

### Resolve context

You can also pass in additional data that will be used in various callbacks that will be called when resolving the key.

```ts
const container = new PumpIt()
const resolveCtx = { foo: 'bar' }
container.resolve('some_key', resolveCtx)
```

> Read about [transforming dependencies](#transforming-dependencies) to see how context is passed to the callbacks.

## Injection tokens

Injection tokens are the values by which the injection container knows how to resolve registered data. They can be `string`, `Symbol`, or any object.

```ts
const container = new PumpIt()
const symbolToken = Symbol('my symbol')

class A {}

//bind to container
container.bindClass('my_token', A)
container.bindClass(symbolToken, A)
container.bindClass(A, A)

//resolve
container.resolve<A>('my_token')
container.resolve<A>(symbolToken)
container.resolve<A>(A)

//inject tokens
class B {
  static inject = [symbolToken, 'my_token', A]
  constructor(aOne: A, aTwo: A, aThree: A) {}
}
```

## Injection scopes

There are four types of injection scopes:

### Singleton

Once the value is resolved the value will not be changed as long as the same container is used.

In the next example, both `A` and `B` instances have the same instance of `C`

```ts
import { PumpIt, SCOPE } from 'pumpit'

container = new PumpIt()

class A {
  static inject = [C, B]
  constructor(
    public c: C,
    public b: B
  ) {}
}
class B {
  static inject = [C]
  constructor(public c: C) {}
}

class C {}

container.bindClass(A, A)
container.bindClass(B, B)
container.bindClass(C, C, { scope: SCOPE.SINGLETON })

// A -> B,C,
// B -> C
const instanceA = container.resolve(A)

//A and B share the same instance C
instanceA.c === instanceA.b.c
```

### Transient

This is the **default scope**. Every time the value is requested, a new value will be returned (resolved).
In the case of `classes`, it will be a new instance every time, in the case of factories, the factory function will be executed every time.

In the next example, both `A` and `B` instances will have a different `C` instance.

```ts
import { PumpIt, SCOPE } from 'pumpit'
container = new PumpIt()

class A {
  static inject = [C, B]
  constructor(
    public c: C,
    public b: B
  ) {}
}
class B {
  static inject = [C]
  constructor(public c: C) {}
}

class C {}

container.bindClass(A, A)
container.bindClass(B, B)
container.bindClass(C, C, { scope: SCOPE.TRANSIENT })

// A -> B,C,
// B -> C
const instanceA = container.resolve(A)

//C instance is created two times
//A and B have different instances of C
instanceA.c !== instanceA.b.c //C
```

### Request

This is similar to the `singleton` scope except the value is resolved **once** per resolve request chain.
Every new call to `container.resolve()` will create a new value.

```ts
import { PumpIt, SCOPE } from 'pumpit'

container = new PumpIt()

class A {
  static inject = [C, B]
  constructor(
    public c: C,
    public b: B
  ) {}
}
class B {
  static inject = [C]
  constructor(public c: C) {}
}

class C {}

container.bindClass(A, A)
container.bindClass(B, B)
container.bindClass(C, C, { scope: SCOPE.REQUEST })

const firstA = container.resolve(A)
const secondA = container.resolve(A)
firstA.c === firstA.b.c // A and B share C

secondA.c === secondA.b.c // A and B share C

secondA.c !== firstA.c //C from first request is different to the C from the second request
```

### Container singleton

This scope is similar to the regular `singleton` scope, but in the case of [child containers](#child-containers), the child container will create its version of the singleton instance.

In the next example, the child container will create its own version of the singleton instance.

```ts
import { PumpIt, SCOPE } from 'pumpit'

container = new PumpIt()
const childContainer = container.child()

class A {
  static count = 0
  constructor() {
    A.count++
  }
}

container.bindClass(A, A, { scope: SCOPE.CONTAINER_SINGLETON })

const parentOneA = container.resolve(A)
const parentTWoA = container.resolve(A)

parentOneA === parentTWoA
A.count === 1

const childOneA = childContainer.resolve(A)
const childTwoA = childContainer.resolve(A)

childOneA === childTwoA
A.count === 2

// parent and child have different instances
childOneA !== parentOneA
```

> Injection scopes do not apply to bound values (`bindValue`)

## Optional injections

Whenever the injection container **can't** resolve the requested dependency anywhere in the chain, it will immediately **throw**.

But you can make the dependency optional, and if it cant be resolved, the container will not throw, and `undefined` will be injected in place of the requested dependency. For this, you need to use the `get()` helper function.

```ts
import { PumpIt, get } from 'pumpit'

const container = new PumpIt()

class A {
  //make B optional dependency
  static inject = [get(B, { optional: true })]
  constructor(public b: B) {}
}
class B {}

//NOTE: B is NOT registered with the container
container.bindClass(A, A)

const instanceA = container.resolve(A)

instanceA.b // undefined
```

## ~~Circular dependencies~~

> NOTE: Circular dependency functionality has been removed in version 6.
> If you want to use circular dependency you can use [version 5](https://github.com/ivandotv/pumpit/tree/v5.0.0)

## ~~Injecting arrays~~

> NOTE: Injecting array as a dependency has been removed in version 6.
> If you want to use this feature you can use [version 5](https://github.com/ivandotv/pumpit/tree/v5.0.0)

### Transforming injected dependencies

Injected dependencies can also be manipulated just before they are injected. For this, we use the `transform()` helper function.

`transform` function wraps the injected dependencies, and accepts a callback which will receive all the resolved dependencies that need to be injected, and it should return an array of dependencies. whatever is returned from the callback, will be injected.

```ts
import { transform, PumpIt } from 'pumpit'

const container = new PumpIt()

const keyA = Symbol()
const keyB = Symbol()
const keyC = Symbol()

const valueA = { name: 'a' }
const valueB = { name: 'b' }
const valueC = { name: 'c' }

const resolveCtx = { hello: 'world' }

class TestA {
  static inject = transform(
    [keyA, keyB, keyC],
    (
      { container, ctx },
      a: typeof valueA,
      b: typeof valueB,
      c: typeof valueC
    ) => {
      container === pumpIt // instance of PumpIt
      ctx === resolveCtx // context data

      a === valueA
      b === valueB
      c === valueC

      //default implementation, return the same dependencies in the same order
      return [a, b, c]
    }
  )

  constructor(a: typeof valueA, b: typeof valueB, c: typeof valueC) {}
}
```

### Post construct method

If the class that is being constructed (resolved) has a "postConstruct" method defined it will be called automatically when the class instance is created, in the case of singleton instances it will be called only once. One more important thing about `postConstruct` method is that it will be called in the reverse order of the resolution chain. [Please refer to this test for a concrete example](src/__tests__/instance/post-construct.test.ts#L22)

## Removing values from the container

Registered values can be removed from the container. When the value is removed, trying to resolve the value will throw an error.

```ts
const container = new PumpIt()

container.bindValue('name', 'Mario')

container.unbind('name')

container.resolve('name') // throws error
```

### Calling the dispose method

If the class has a method `dispose()` it will automatically be called on the disposed of value, but **only** if the value is a `singleton`.

Internally, the container will remove the value from its internal pool, and if the value was registered with the scope: `singleton` and the value has been resolved before (class has been instantiated or factory function executed). That means that the container holds an instance of the value, and it will try to call the `dispose of` method on that instance, or in the case of the factory, on whatever was returned from the factory.

```ts
const container = new PumpIt()

class TestA {
  static count = 0
  dispose() {
    TestA.count++
  }
}

pumpIt.bindClass(TestA, TestA, { scope: 'SINGLETON' })
pumpIt.unbind(TestA)

pumpIt.has(TestA) // false

TestA.count === 1
```

If you don't want to call the `dispose` method, pass `false` as the second parameter `container.unbind(TestA, false)`

### Dispose callback

When registering the class or factory, you can provide an `unbind` callback that will be called when the value is about to be removed from the container.

> `unbind` callback will be called regardless of whether the value to be removed is `singleton` or not.

```ts
const container = new PumpIt()

class TestA {}

container.bindClass(TestA, TestA, {
  scope: 'SINGLETON',
  unbind: (container, dispose, value) => {
    container === pumpIt
    value // TestA instance is scope: singleton otherwise TestA constructor
    dispose // true if `dispose` method should be called
  }
})
```

Please note that in the preceding example `value` property in the callback can be a `TestA` constructor or an instance of `TestA` depending on if the value was registered with the scope of `singleton` and it was resolved before (container holds the instance singleton).

### Removing all the values from the container

You can remove all the values from the container by calling `container.unbindAll()`. This method will remove all the keys from the container, so the container will be empty. All the same, rules apply as for the `container.unbind()` method.

```ts
const container = new PumpIt()
const callDispose = true
container.unbindAll(callDispose)
```

### Locking the container

If the container is `locked` that particular container can't accept new bindings or unbind the values already in the container.
Locking the container does not affect child containers.

```ts
const container = new PumpIt()

class TestA {}
class TestB {}

container.bindClass(TestA, TestA)

container.lock()

container.isLocked() // returns true

container.bindClass(TestB,TestB) //throws error

container.unbind(TestA) //throws error

```
## Child containers

Every container instance can create a **child** container.

The child container is a new `PumpIt` instance that is connected to the parent container instance and it inherits all the values that are registered with the parent.

The great thing about the child container is that it can _shadow_ the parent value by registering a value with the same key.

### Shadowing values

The child container can have the same `key` as the parent, in that case when the value is resolved, the child container value will be returned.

```ts
const parent = new PumpIt()
const child = parent.child()

const key = 'some_key'

class ParentClass {}
class ChildClass {}

parent.bindClass(key, ParentClass)

child.bindClass(key, ChildClass)

const instance = child.resolve(key) // ChildClass
```

> Parent -> child chains can be as long as you like `grand parent -> parent -> child` ...

### Checking for values

When you check if the value exists on the child, the parent instance is also
searched. You can optionally disable searching on the parent.

```ts
const parent = new PumpIt()
const child = parent.child()

class TestA {}

parent.bindClass(TestA, TestA)

child.has(TestA) //true

// disable search on the parent
child.has(TestA, false) // false
```

### Child singletons

If the `parent` container has registered a value with a scope `SINGLETON` all child containers will share the same instance however, if the parent has registered the value with the scope `CONTAINER_SINGLETON` then child containers
will create their versions of singleton instances.

```ts
const parent = new PumpIt()
const child = parent.child()

class TestA {
  static count = 0

  constructor() {
    TestA.count++
  }
}

parent.bindClass(TestA, TestA, { scope: SCOPE.CONTAINER_SINGLETON })

const parentInstance = parent.resolve<TestA>(TestA)
const childInstance = child.resolve<TestA>(TestA)

parentInstance !== childInstance
TestA.count === 2
```
### Validating bindings

Calling `validate` or `validateSafe` will validate the bindings in the container.
It will check if all the dependencies that are required by other bindings are present in the container.

`validate` method will throw an error, while `validateSafe` will return a validation result. Calling these methods will not instantiate classes or run factory functions, so there is still a possibility that you will not get what you want when dependencies are resolved at runtime.

In the next example `RequestTest` class is not present in the container, but is needed in class `TestB`

```ts

const pumpIt = new PumpIt()

class TestA {}

class TestB {
  static inject = [TestA]

  constructor(
    public a: TestA,
  ) {}
}

//bind only TestB
pumpIt.bindClass(TestB, TestB)

const result = pumpIt.validateSafe()

expect(result).toEqual({
  valid: false,
  errors: [{ key: TestA, wantedBy: [TestB] }],
})

```

## Helpers

### Register injections

`registerInjections` helper function with a class or factory. It will automatically create `inject` property on the class or factory function.

```ts
test("use helper to inject in to class", () => {
  const pumpIt = new PumpIt()

  class TestA {}
  class TestB {}
  class TestC {
    constructor(
      public a: TestA,
      public b: TestB,
    ) {}
  }

  registerInjections(TestC, [TestA, TestB])

  pumpIt
    .bindClass(TestA, TestA)
    .bindClass(TestB, TestB)
    .bindClass(TestC, TestC)

  const result = pumpIt.resolve<TestC>(TestC)

  expect(result.a).toBeInstanceOf(TestA)
  expect(result.b).toBeInstanceOf(TestB)
})
```
## API docs

`PumpIt` is written in TypeScript, [auto generated API documentation](docs/api/README.md) is available.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
