/* eslint-disable @typescript-eslint/no-empty-function */
import { Pumpa } from '../pumpa'

describe('Unbind', () => {
  test('throw if the key is not found', () => {
    const pumpa = new Pumpa()

    expect(() => pumpa.unbind('does_not_exist')).toThrowError('not found')
  })

  test('unbind factory', () => {
    const pumpa = new Pumpa()
    const keyA = Symbol('key_a')

    const factoryReturnValue = 'hello'
    const factory = () => () => factoryReturnValue
    factory.dispose = jest.fn()

    pumpa.bindFactory(keyA, factory)
    pumpa.unbind(keyA)

    expect(pumpa.has(keyA)).toBe(false)
  })

  test('unbind factory and call the "dispose" method', () => {
    const pumpa = new Pumpa()
    const keyA = Symbol('key_a')

    const disposeCall = jest.fn()
    const factory = () => {
      const functionToReturn = () => {}

      functionToReturn.dispose = disposeCall

      return functionToReturn
    }

    pumpa.bindFactory(keyA, factory, { scope: 'SINGLETON' })
    pumpa.resolve(keyA)

    pumpa.unbind(keyA)

    expect(pumpa.has(keyA)).toBe(false)
    expect(() => pumpa.resolve(keyA)).toThrowError('not found')
    expect(disposeCall).toHaveBeenCalled()
  })

  test('unbind factory and do not call the "dispose" method', () => {
    const pumpa = new Pumpa()
    const keyA = Symbol('key_a')

    const disposeCall = jest.fn()
    const factory = () => {
      const functionToReturn = () => {}

      functionToReturn.dispose = disposeCall

      return functionToReturn
    }

    pumpa.bindFactory(keyA, factory, { scope: 'SINGLETON' })
    pumpa.resolve(keyA)

    pumpa.unbind(keyA, false)

    expect(pumpa.has(keyA)).toBe(false)
    expect(() => pumpa.resolve(keyA)).toThrowError('not found')
    expect(disposeCall).not.toHaveBeenCalled()
  })

  test('unbind class', () => {
    const pumpa = new Pumpa()
    const keyA = Symbol('key_a')

    const disposeCall = jest.fn()
    class TestA {
      dispose() {
        disposeCall()
      }
    }

    pumpa.bindClass(keyA, TestA)
    pumpa.unbind(keyA)

    expect(pumpa.has(keyA)).toBe(false)
  })

  test('unbind class and call the "dispose" method', () => {
    const pumpa = new Pumpa()
    const keyA = Symbol('key_a')

    const disposeCall = jest.fn()
    class TestA {
      dispose() {
        disposeCall()
      }
    }

    pumpa.bindClass(keyA, TestA, { scope: 'SINGLETON' })
    pumpa.resolve(keyA)

    pumpa.unbind(keyA)

    expect(pumpa.has(keyA)).toBe(false)
    expect(() => pumpa.resolve(keyA)).toThrowError('not found')
    expect(disposeCall).toHaveBeenCalled()
  })

  test('unbind class and do not call the "dispose" method', () => {
    const pumpa = new Pumpa()
    const keyA = Symbol('key_a')

    const disposeCall = jest.fn()
    class TestA {
      dispose() {
        disposeCall()
      }
    }

    pumpa.bindClass(keyA, TestA, { scope: 'SINGLETON' })
    pumpa.resolve(keyA)

    pumpa.unbind(keyA)

    expect(pumpa.has(keyA)).toBe(false)
    expect(() => pumpa.resolve(keyA)).toThrowError('not found')
    expect(disposeCall).toHaveBeenCalled()
  })

  describe('Unbind all', () => {
    test('after removing all the keys, no keys can be retrieved', () => {
      const pumpa = new Pumpa()
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

      pumpa.bindFactory(factoryKey, factory, { scope: 'SINGLETON' })
      pumpa.bindClass(classKey, TestA)
      pumpa.bindValue(valueKey, value)

      pumpa.resolve(factoryKey)
      pumpa.unbindAll()

      expect(pumpa.has(factoryKey)).toBe(false)
      expect(pumpa.has(classKey)).toBe(false)
      expect(pumpa.has(valueKey)).toBe(false)
      expect(() => pumpa.resolve(factoryKey)).toThrowError('not found')
      expect(() => pumpa.resolve(classKey)).toThrowError('not found')
      expect(() => pumpa.resolve(classKey)).toThrowError('not found')
      expect(factoryDisposeCall).toHaveBeenCalledTimes(1)
      expect(classDisposeCall).not.toHaveBeenCalled()
    })

    test('do not call the dispose method', () => {
      const pumpa = new Pumpa()
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

      pumpa.bindFactory(factoryKey, factory, { scope: 'SINGLETON' })
      pumpa.bindClass(classKey, TestA, { scope: 'SINGLETON' })
      pumpa.bindValue(valueKey, value)

      pumpa.resolve(factoryKey)
      pumpa.unbindAll(false)

      expect(factoryDisposeCall).not.toHaveBeenCalled()
      expect(classDisposeCall).not.toHaveBeenCalled()
    })
  })

  test('when singleton instances are cleared, singletons are created again', () => {
    const pumpa = new Pumpa()
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
    pumpa.bindClass(keyA, TestA, {
      scope: 'SINGLETON',
      beforeResolve: ({ value, deps }) => {
        beforeResolveCount++

        return new value(...deps)
      },
      afterResolve
    })
    const instanceOne = pumpa.resolve(keyA)

    pumpa.clearInstances()
    const instanceTwo = pumpa.resolve(keyA)

    expect(instanceOne).not.toBe(instanceTwo)
    expect(TestA.count).toBe(2)
    expect(disposeCall).toHaveBeenCalledTimes(1)
    expect(beforeResolveCount).toBe(2)
    expect(afterResolve).toHaveBeenCalledTimes(2)
  })
})
