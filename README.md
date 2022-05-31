# PumpIt

[![Test](https://github.com/ivandotv/pumpit/actions/workflows/CI.yml/badge.svg)](https://github.com/ivandotv/pumpit/actions/workflows/CI.yml)
[![Codecov](https://img.shields.io/codecov/c/gh/ivandotv/pumpit)](https://app.codecov.io/gh/ivandotv/pumpit)
[![GitHub license](https://img.shields.io/github/license/ivandotv/pumpit)](https://github.com/ivandotv/pumpit/blob/main/LICENSE)

`PumpIt` is a small [(~2KB)](https://bundlephobia.com/package/pumpit) dependency injection container without the decorators, suitable for front-end code.
It supports circular dependencies (via Proxy), injecting arrays of dependencies as a single property, different injection scopes, child containers, etc...

<!-- toc -->

- [Motivation](#motivation)
- [Getting Started](#getting-started)
  * [Registering classes](#registering-classes)
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
- [Circular dependencies](#circular-dependencies)
- [Injecting arrays](#injecting-arrays)
- [Transforming dependencies](#transforming-dependencies)
  * [Transforming injected dependencies](#transforming-injected-dependencies)
- [Removing values from the container](#removing-values-from-the-container)
  * [Calling the dispose method](#calling-the-dispose-method)
  * [Dispose callback](#dispose-callback)
  * [Removing all the values from the container](#removing-all-the-values-from-the-container)
  * [Clearing container values](#clearing-container-values)
- [Child containers](#child-containers)
  * [Shadowing values](#shadowing-values)
  * [Checking for values](#checking-for-values)
  * [Child singletons](#child-singletons)
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

There is also alternative syntax that you can use when you don't want to use the static `inject` property, or you are importing class from third-party packages.

```ts
import { PumpIt } from 'pumpit'

const container = new PumpIt()
class TestA {
  constructor(b: TestB) {}
}

class TestB {}

//`bind`(register)  classe to the injection container.
container.bindClass(TestA, { value: TestA, inject: [TestB] })
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
  constructor(public c: C, public b: B) {}
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
  constructor(public c: C, public b: B) {}
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
//A and B have different instance of C
instanceA.c !== instanceA.b.c //C
```

### Request

This is similar to the `singleton` scope except the value is resolved **once** per resolve request.
Every new call to `container.resolve()` will create a new value.

```ts
import { PumpIt, SCOPE } from 'pumpit'

container = new PumpIt()

class A {
  static inject = [C, B]
  constructor(public c: C, public b: B) {}
}
class B {
  static inject = [C]
  constructor(public c: C) {}
}

class C {}

container.bindClass(A, A)
container.bindClass(B, B)
container.bindClass(C, C, { scope: SCOPE.REQUEST })

const firstA = container.resolve(A) // new C
const secondA = container.resolve(A) // new C

firstA.c === firstA.b.c

secondA.c === secondA.b.c

secondA.c !== firstA.c
```

### Container singleton

This scope is similar to the regular `singleton` scope, but in the case of [child containers](#child-containers), the child container will create its version of the singleton instance.

In the next example, the child container will create its version of the singleton.

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

## Circular dependencies

`PumpIt` supports circular dependencies. The container uses [`Proxy`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) under the hood, to handle circular dependency cases.

For example: In case of circular dependency: `A -> B -> A`
`B` will be given a `proxy` object that will represent the `A` instance, and **after** the `B` constructor runs, the proxy will point to the instance of `A`. To do that we need to mark the `A` dependency as `lazy`. For this, we need to use the `get()` helper function.

```ts
import { PumpIt, get } from 'pumpit'

const container = new PumpIt()

class A {
  //A wants B
  static inject = [B]

  constructor(public b: B) {}
  hello() {
    return 'hello'
  }
}

class B {
  //B wants A
  static inject = [get(A, { lazy: true })]

  constructor(public a: A) {
    this.a // will be a proxy untill the constructor runs to completion
    this.a.hello() //error!
  }

  someMethod() {
    this.a.hello() //no error - proxy points to A
  }
}

container.bindClass(A, A).bindClass(B, B)

const instanceA = container.resolve(A)

instanceA.b.a === instanceA
```

Please note that even though the dependency `A` in the class `B` is marked as `lazy`, it doesn't mean that the injected value will always be a proxy.
If there is no circular dependency, then the regular `A` instance would be injected (which is not the case in the above example).

> There is also a helper function `isProxy()` which could tell you if the injected dependency is a `Proxy`.

```ts
class B {
  static inject = [get(A, { lazy: true })]

  constructor(public a: A) {
    this.a // will be a proxy untill the constructor runs to completion
    this.a.hello() //error!

    // check if proxy
    isProxy(this.a) //true
  }
}
```

## Injecting arrays

You can inject arrays of dependencies as a single property. For this, to work we need to use the `getArray()` helper function.

```ts
import { PumpIt, getArray } from 'pumpit'

const container = new PumpIt()

const keyOne = 'key_one'
const keyTwo = Symbol('key_two')

const valueOne = 'hello'
const valueTwo = 123

class TestA {
  static inject = [getArray([keyOne, keyTwo])]

  constructor(public props: [string, number]) {
    this.props[0] === 'hello'
    this.props[1] === 123
  }
}
```

Injecting arrays covers some additional scenarios:

- If the dependency is not found, inject `undefined` in its place.

```ts
const keyTwo = 'key_two'
const valueTwo = 123

class TestA {
  static inject = [getArray([get('not_found', { optional: true }), keyTwo])]

  constructor(public props: [string?, number]) {
    this.props[0] === undefined
    this.props[1] === 123

    this.props.length === 2
  }
}
```

-If the dependency is not found _ignore it_. The container will not inject `undefined` into the array, and that will affect the length of the array and the order of dependencies inside the array.

```ts
const keyTwo = 'key_two'
const valueTwo = 123

class TestA {
  static inject = [
    getArray([get('not_found', { optional: true }), keyTwo], {
      removeUndefined: true // remove not found values
    })
  ]

  constructor(public props: [string?, number?]) {
    //second dependency is the only value in the array
    this.props[0] === 123
    this.props.length === 1
  }
}
```

If none of the dependencies can be resolved, set the whole array to undefined.

```ts
class TestA {
  static inject = [
    getArray(
      [
        get('not_found', { optional: true }),
        get('not_found_2', { optional: true })
      ],
      {
        removeUndefined: true,
        setToUndefinedIfEmpty: true
      }
    )
  ]

  constructor(public props?: [string?, number?]) {
    this.props === undefined
  }
}
```

## Transforming dependencies

Dependencies can be transformed before being resolved.

They can be manipulated just **before** they are created, or **after** they are created.

- "`beforeResolve`" callback is called **before** the registered value is created. In the case of the `class` just before the class instance is created. In the case of the `factory` just before the factory is executed.

- "`afterResolve`" - callback is called **after** the `class` instance is created, or `factory` function is executed. The `value` in the callback represents whatever is returned from the `beforeResolve` callback. This callback is the perfect place to do any `post` creation setup.

```ts
const container = new PumpIt()
const valueB = { name: 'Ivan' }
const resolveCtx = { foo: 'bar' }

class TestA {
  static inject = [keyB]

  constructor(public keyB: typeof valueB) {}
  hello(){
    return  'hello world'
  }
}

container.bindValue(keyB, valueB)

container.bindClass(keyA, TestA, {
  beforeResolve: ({ container, value, ctx }, ...deps) => {

    container === pumpIt // instance of PumpIt
    value === TestA // class constructor
    ctx === resolveCtx//context data if any
    deps ===[valueB]// resolved dependency of class TestA

    // internally this is the default behavior
    return new value(...deps)

    // in case of factory function
    // return value(...deps)
  },
  afterResolve:({container,value,ctx}=>{

    container === pumpIt // instance of PumpIt
    value // whatever is returned from the "beforeResolve" callback
    //^ in this case it is an instance of TestA
    ctx === resolveCallbackData //context data if any

    // you can do custom setup here
    value.hello() // hello world
  })
})

const instance = pumpIt.resolve(TestA, resolveCtx)
```

The number of times these callbacks will be executed directly depends on the `scope` with which the value was registered. In the case of a `singleton` scope callbacks will be executed only once, since the values are resolved only once.

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

### Clearing container values

You can clear all the singleton values that are present in the container. When the values are cleared, resolving those values again will create new singletons. Also, the `dispose` method will be called (if present on the instance).

```ts
const container = new PumpIt()

class TestA {}

container.bindClass(TestA, TestA, { scope: 'SINGLETON' }) // or SCOPE.CONTAINER_SINGLETON

const instanceOne = pumpIt.resolve(TestA)

container.clearAllInstances()

const instanceTwo = container.resolve(TestA) // new instance

instanceOne !== instanceTwo
```

A particular singleton instance can also be cleared by using the `key`:

```ts
const container = new PumpIt()

class TestA {}

container.bindClass(TestA, TestA, { scope: SCOPE.SINGLETON }) // or SCOPE.CONTAINER_SINGLETON

const instanceOne = pumpIt.resolve(TestA)

container.clearInstance(TestA)
```

Clearing a single singleton will return true if the singleton `key` was found, false otherwise.

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

## API docs

`PumpIt` is written in TypeScript, [auto generated API documentation](docs/api/README.md) is available.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
