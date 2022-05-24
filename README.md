# Microbundle Typescript Starter Template

Opinionated template repository for creating Javascript libraries with Typescript, Microbundle, Jest, and a bunch of other tools.

<!-- toc -->

<!-- tocstop -->

## About

`PumpIt` is a small (~2KB) dependency injection container, without decorators, sutable for front-end code. It supports circulary dependencies (via Proxy), injecting arrays, differen injection scopes, child injectors etc..

## Motivation

Dependency injection is a powerfull concept, and there are some execelen solutions like: [tsyringe](), [awilix]() and [inversivfy](), however they all use decorators (which are great, but not a standard), and there filezize is not sutable for front-end. So I've decided to create an implementation of dependency injection container theat is small, and doesn't use decorators.

## Getting Started

Since `PumpIt` does not rely on decorators the injection is done via the `injection` prop. When used with `classes`, `inject` will be a static property on the class, and it will hold an array of registered injection `tokens` that will be injected in to the constructor in the same order when the class instance is created.

### Registering classes

```ts
import { PumpIt } from 'pumpit'

class TestA {
  static inject = [B]

  constructor(b: B) {}
}

class TestB {}

//`bind`(register)  classes to the injection container.
pumpIt.bindClass(TestA, TestA)
pumpIt.bindClass(TestB, TestB)

//resolve TestA class
const instanceA = pumpIt.resolve<TestA>(TestA)

instanceA.b // injected B instance
```

### Injection tokens

Injection tokens are the values by which the injection container knows how to resolve injections. They can be `string`,`Symbol` or any object.

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

As you can see using the same object for token and for value to be resolved it the easiest way.

```ts
container.bindClass(A, A)
```

### Registering factories

When registering factories, `function` needs to be provided as the value, and when that `factory` is resolved, the function will be executed, and returned result will be the value that will be injected where it s requested.

```ts
const myFactory = () => 'hello world'

const container = new PumpIt()

container.bindFactory(myFactory, myFactory)

const value: string = container.resolve(myFactory) //hello world
```

Factories can also have dependencies injected.

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

I encourage you to experiment with factories because they enable you return all kinds of things when they are resolved e.g higher order functions.

### Registering values

```ts
const container = new PumpIt()

const myConfig = { foo: 'bar' }

container.bindValue('app_config', myConfig)

container.resolve('app_config') // myConfig
```

## Injection scopes

There are three types of injection scopes:

- `singleton` - once the value is resolved the value will not be changed as long as the same container is used.

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

const instanceA = container.resolve(A)

//A and B share the same instance C
instanceA.c === instanceA.b.c
```

- `transient` - This is the **default scope**. Every time the value is requested, new value will be returned (resolved). In case of `classes` it will be a new instance, in case of factories, factory function will be executed every time.

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

const instanceA = container.resolve(A)

//C instance is created two times
//A and B have different instance of C
instanceA.c !== instanceA.b.c //C
```

-`request` - this is similar to `singleton` scope except the value is resolved **once** per resolve request. Every new call to `container.resolve()` will have a new value.

> Injection scopes are not applicable to binded values.

```ts
//singleton example
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

## Optional injections

Whenever the injection container can't resolve the dependency, anyhwere in the chain it will immediately throw. But you can make the dependency optional, and if it cant be resolved, the container will not throw, and `undefined` will be injected in place of dependency.

```ts
import { PumpIt, get } from 'pumpit'

const container = new PumpIt()

class A {
  static inject = [get(B, { optional: true })]
  constructor(public b: B) {}
}
class B {}

//NOTE: B is NOT binded to the container
container.bindClass(A, A)

const instanceA = container.resolve(A)

instanceA.b // undefined
```

## Circular dependencies

PumpIt supports circular dependencies, the solution is built with [`Proxy`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)

For example: In case of circular dependency: `A -> B -> A`
`B` will be given a `proxy` object that will represent the `A` instance, and **after** the `B` constructor runs, proxy will point to the instance of `A`. To do that we need to mark the `A` dependency as `lazy`.

```ts
import { PumpIt, get, isProxy } from 'pumpit'

const container = new PumpIt()

class A {
  static inject = [B]
  constructor(public b: B) {}
  hello() {
    return 'hello'
  }
}
class B {
  static inject = [get(A, { lazy: true })]
  constructor(public a: A) {
    this.a // will be a proxy untill the constructor runs to completion
    this.a.hello() //error!
    isProxy(this.a) //true
  }

  someMethod() {
    this.a.hello() //ok
  }
}

container.bindClass(A, A)
container.bindClass(B, B)

const instanceA = container.resolve(A)

instanceA.b.a === instanceA
```

Please note that eventgoug the dependency `A` in the class `B` is marked as `lazy`, it doesn't mean that the injected value will always be a proxy if there is no circular dependency, then the regular `A` instance would be injected (which is not the case in the above example).

> There is a helper function `is  Proxy()` which could tell you if the injeted dependency is a proxy.

## Injecting arrays

## Transforming dependencies

## Removing injections (unbind)

## Child injectors

## API docs

## Licence
