import { Pumpa } from '../pumpa'

describe('Pumpa', () => {
  describe('Bind value', () => {
    test('resolve value', () => {
      const pumpa = new Pumpa()
      const key = 'name'
      const nameValue = 'ivan'

      pumpa.bindValue(key, nameValue)
      const result = pumpa.resolve(key)

      expect(result).toBe(nameValue)
    })
    test('resolve value by tag', () => {
      const pumpa = new Pumpa()
      const key = 'name'
      const nameValue = 'ivan'

      pumpa.bindValue(key, nameValue)

      const result = pumpa.resolve(key)

      expect(result).toBe(nameValue)
    })

    test('Throw if key is already registered', () => {
      const pumpa = new Pumpa()
      const key = 'name'
      const nameValue = 'ivan'

      pumpa.bindValue(key, nameValue)

      expect(() => pumpa.bindValue(key, nameValue)).toThrowError(`${key}`)
    })

    test('Throw error if resolved key cannot be found', () => {
      const pumpa = new Pumpa()
      const key = 'name'

      expect(() => pumpa.resolve(key)).toThrowError(`${key}`)
    })
  })
})
