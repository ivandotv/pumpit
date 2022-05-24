/* eslint-disable @typescript-eslint/no-empty-function */
import { PumpIt } from '../pumpit'

describe('Unbind', () => {
  test('throw if the key is not found', () => {
    const pumpIt = new PumpIt()

    expect(() => pumpIt.unbind('does_not_exist')).toThrowError('not found')
  })

  test('unbind factory', () => {
    const pumpIt = new PumpIt()
    const keyA = Symbol('key_a')

    const factoryReturnValue = 'hello'
    const factory = () => () => factoryReturnValue
    factory.dispose = jest.fn()

    pumpIt.bindFactory(keyA, factory)
    pumpIt.unbind(keyA)

    expect(pumpIt.has(keyA)).toBe(false)
  })

  test('unbind factory and call the "dispose" method', () => {
    const pumpIt = new PumpIt()
    const keyA = Symbol('key_a')

    const disposeCall = jest.fn()
    const factory = () => {
      const functionToReturn = () => {}

      functionToReturn.dispose = disposeCall

      return functionToReturn
    }

    pumpIt.bindFactory(keyA, factory, { scope: 'SINGLETON' })
    pumpIt.resolve(keyA)

    pumpIt.unbind(keyA)

    expect(pumpIt.has(keyA)).toBe(false)
    expect(() => pumpIt.resolve(keyA)).toThrowError('not found')
    expect(disposeCall).toHaveBeenCalled()
  })

  test('unbind factory and call the "dispose" callback', () => {
    const pumpIt = new PumpIt()
    const keyA = Symbol('key_a')

    const factory = () => {
      return {}
    }

    const unbindCallback = jest.fn()

    pumpIt.bindFactory(keyA, factory, {
      scope: 'SINGLETON',
      unbind: unbindCallback
    })

    const factoryValue = pumpIt.resolve(keyA)

    pumpIt.unbind(keyA)

    expect(unbindCallback).toHaveBeenCalledWith({
      container: pumpIt,
      dispose: true,
      value: factoryValue
    })
  })

  test('dispose callback value is empty when the bound value is not a singleton', () => {
    const pumpIt = new PumpIt()
    const keyA = Symbol('key_a')

    const factory = () => {
      return {}
    }

    const unbindCallback = jest.fn()

    pumpIt.bindFactory(keyA, factory, {
      unbind: unbindCallback
    })
    pumpIt.resolve(keyA)

    pumpIt.unbind(keyA)

    expect(unbindCallback).toHaveBeenCalledWith({
      container: pumpIt,
      dispose: true,
      value: undefined
    })
  })

  test('unbind factory and do not call the "dispose" method', () => {
    const pumpIt = new PumpIt()
    const keyA = Symbol('key_a')

    const disposeCall = jest.fn()
    const factory = () => {
      const functionToReturn = () => {}

      functionToReturn.dispose = disposeCall

      return functionToReturn
    }

    pumpIt.bindFactory(keyA, factory, { scope: 'SINGLETON' })
    pumpIt.resolve(keyA)

    pumpIt.unbind(keyA, false)

    expect(pumpIt.has(keyA)).toBe(false)
    expect(() => pumpIt.resolve(keyA)).toThrowError('not found')
    expect(disposeCall).not.toHaveBeenCalled()
  })

  test('unbind class', () => {
    const pumpIt = new PumpIt()
    const keyA = Symbol('key_a')

    const disposeCall = jest.fn()
    class TestA {
      dispose() {
        disposeCall()
      }
    }

    pumpIt.bindClass(keyA, TestA)
    pumpIt.unbind(keyA)

    expect(pumpIt.has(keyA)).toBe(false)
  })

  test('unbind class and call the "dispose" method', () => {
    const pumpIt = new PumpIt()
    const keyA = Symbol('key_a')

    const disposeCall = jest.fn()
    class TestA {
      dispose() {
        disposeCall()
      }
    }

    pumpIt.bindClass(keyA, TestA, { scope: 'SINGLETON' })
    pumpIt.resolve(keyA)

    pumpIt.unbind(keyA)

    expect(pumpIt.has(keyA)).toBe(false)
    expect(() => pumpIt.resolve(keyA)).toThrowError('not found')
    expect(disposeCall).toHaveBeenCalled()
  })

  test('unbind class and call the "dispose" callback', () => {
    const pumpIt = new PumpIt()
    const keyA = Symbol('key_a')

    class TestA {}

    const unbindCallback = jest.fn()

    pumpIt.bindClass(keyA, TestA, {
      scope: 'SINGLETON',
      unbind: unbindCallback
    })

    const instance = pumpIt.resolve(keyA)

    pumpIt.unbind(keyA)

    expect(unbindCallback).toHaveBeenCalledWith({
      container: pumpIt,
      dispose: true,
      value: instance
    })
  })

  test('dispose callback value is empty when the bound class is not a singleton', () => {
    const pumpIt = new PumpIt()
    const keyA = Symbol('key_a')

    class TestA {
      hello() {
        return 'hello'
      }
    }

    const unbindCallback = jest.fn()

    pumpIt.bindClass(keyA, TestA, {
      scope: 'TRANSIENT',
      unbind: unbindCallback
    })

    pumpIt.resolve(keyA)
    pumpIt.unbind(keyA)

    expect(unbindCallback).toHaveBeenCalledWith({
      container: pumpIt,
      dispose: true,
      value: undefined
    })
  })

  test('unbind class and do not call the "dispose" method', () => {
    const pumpIt = new PumpIt()
    const keyA = Symbol('key_a')

    const disposeCall = jest.fn()
    class TestA {
      dispose() {
        disposeCall()
      }
    }

    pumpIt.bindClass(keyA, TestA, { scope: 'SINGLETON' })
    pumpIt.resolve(keyA)

    pumpIt.unbind(keyA)

    expect(pumpIt.has(keyA)).toBe(false)
    expect(() => pumpIt.resolve(keyA)).toThrowError('not found')
    expect(disposeCall).toHaveBeenCalled()
  })

  describe('Unbind all', () => {
    test('after removing all the keys, no keys can be retrieved', () => {
      const pumpIt = new PumpIt()
      const factoryKey = Symbol('a')
      const classKey = Symbol('b')
      const valueKey = Symbol('c')

      const classDisposeCall = jest.fn()
      class TestA {
        dispose() {
          classDisposeCall()
        }
      }

      const factoryDisposeCall = jest.fn()
      const factory = () => {
        const functionToReturn = () => {}

        functionToReturn.dispose = factoryDisposeCall

        return functionToReturn
      }

      const value = { name: 'ivan' }

      pumpIt.bindFactory(factoryKey, factory, { scope: 'SINGLETON' })
      pumpIt.bindClass(classKey, TestA)
      pumpIt.bindValue(valueKey, value)

      pumpIt.resolve(factoryKey)
      pumpIt.unbindAll()

      expect(pumpIt.has(factoryKey)).toBe(false)
      expect(pumpIt.has(classKey)).toBe(false)
      expect(pumpIt.has(valueKey)).toBe(false)
      expect(() => pumpIt.resolve(factoryKey)).toThrowError('not found')
      expect(() => pumpIt.resolve(classKey)).toThrowError('not found')
      expect(() => pumpIt.resolve(classKey)).toThrowError('not found')
      expect(factoryDisposeCall).toHaveBeenCalledTimes(1)
      expect(classDisposeCall).not.toHaveBeenCalled()
    })

    test('do not call the dispose method', () => {
      const pumpIt = new PumpIt()
      const factoryKey = Symbol('a')
      const classKey = Symbol('b')
      const valueKey = Symbol('c')

      const classDisposeCall = jest.fn()
      class TestA {
        dispose() {
          classDisposeCall()
        }
      }

      const factoryDisposeCall = jest.fn()
      const factory = () => {
        const functionToReturn = () => {}

        functionToReturn.dispose = factoryDisposeCall

        return functionToReturn
      }

      const value = { name: 'ivan' }

      pumpIt.bindFactory(factoryKey, factory, { scope: 'SINGLETON' })
      pumpIt.bindClass(classKey, TestA, { scope: 'SINGLETON' })
      pumpIt.bindValue(valueKey, value)

      pumpIt.resolve(factoryKey)
      pumpIt.unbindAll(false)

      expect(factoryDisposeCall).not.toHaveBeenCalled()
      expect(classDisposeCall).not.toHaveBeenCalled()
    })
  })

  test('when singleton instances are cleared, singletons are created again', () => {
    const pumpIt = new PumpIt()
    const keyA = Symbol('key_a')

    const disposeCall = jest.fn()
    class TestA {
      static count = 0

      constructor() {
        TestA.count++
      }

      dispose() {
        disposeCall()
      }
    }

    const afterResolve = jest.fn()
    let beforeResolveCount = 0
    pumpIt.bindClass(keyA, TestA, {
      scope: 'SINGLETON',
      beforeResolve: ({ value }, ...deps) => {
        beforeResolveCount++

        return new value(...deps)
      },
      afterResolve
    })
    const instanceOne = pumpIt.resolve(keyA)

    pumpIt.clearInstances()
    const instanceTwo = pumpIt.resolve(keyA)

    expect(instanceOne).not.toBe(instanceTwo)
    expect(TestA.count).toBe(2)
    expect(disposeCall).toHaveBeenCalledTimes(1)
    expect(beforeResolveCount).toBe(2)
    expect(afterResolve).toHaveBeenCalledTimes(2)
  })
})
