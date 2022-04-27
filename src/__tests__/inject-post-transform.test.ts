import { Pumpa } from '../../src/pumpa'
import { withTransform } from '../utils'

describe('Inject - post transform dependencies', () => {
  describe('Class', () => {
    test('transform function gets resolved dependencies', () => {
      const pumpa = new Pumpa()
      const classKey = Symbol()
      const keyA = Symbol()
      const keyB = Symbol()
      const keyC = Symbol()

      const valueA = {}
      const valueB = {}
      const ValueC = {}

      expect.assertions(3)

      class TestA {
        static inject = withTransform(
          [keyA, keyB, keyC],
          (vA: any, vB: any, vC: any) => {
            expect(vA).toBe(valueA)
            expect(vB).toBe(valueB)
            expect(vC).toBe(ValueC)

            return [vA, vB, vC]
          }
        )
      }

      pumpa
        .addClass(classKey, TestA)
        .addValue(keyA, valueA)
        .addValue(keyB, valueB)
        .addValue(keyC, ValueC)
        .resolve<TestA>(classKey)
    })

    test('Transform function can replace dependencies', () => {
      const pumpa = new Pumpa()
      const classKey = Symbol()
      const keyA = Symbol()
      const keyB = Symbol()
      const keyC = Symbol()

      const valueA = {}
      const valueB = {}
      const ValueC = {}

      const transformedA = {}
      const transformedB = {}
      const transformedC = {}

      class TestA {
        static inject = withTransform(
          [keyA, keyB, keyC],
          (_keyA: any, _keyB: any, _keyC: any) => {
            return [transformedA, transformedB, transformedC]
          }
        )

        constructor(public keyA: any, public keyB: any, public keyC: any) {}
      }

      pumpa
        .addClass(classKey, TestA)
        .addValue(keyA, valueA)
        .addValue(keyB, valueB)
        .addValue(keyC, ValueC)

      const instance = pumpa.resolve<TestA>(classKey)

      expect(instance.keyA).toBe(transformedA)
      expect(instance.keyB).toBe(transformedB)
      expect(instance.keyC).toBe(transformedC)
    })
  })
})
