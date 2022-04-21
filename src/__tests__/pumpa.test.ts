import { Pumpa } from '../pumpa'

describe('Pumpa', () => {
  describe('Bind value', () => {
    test('resolve value', () => {
      const pumpa = new Pumpa()
      const key = 'name'
      const nameValue = 'ivan'

      pumpa.registerValue(key, nameValue)
      const result = pumpa.resolve(key)

      expect(result).toBe(nameValue)
    })
    test('resolve value by tag', () => {
      const pumpa = new Pumpa()
      const key = 'name'
      const tag = 'tag_name'
      const nameValue = 'ivan'

      pumpa.registerValue(key, nameValue, { tag })

      const result = pumpa.resolve(key, { tag })

      expect(result).toBe(nameValue)
    })

    test('Throw if key is already registered', () => {
      const pumpa = new Pumpa()
      const key = 'name'
      const nameValue = 'ivan'

      pumpa.registerValue(key, nameValue)

      expect(() => pumpa.registerValue(key, nameValue)).toThrowError(`${key}`)
    })
    test('Throw if key with a tag i already registered', () => {
      const pumpa = new Pumpa()
      const key = 'name'
      const tag = 'tag_name'
      const nameValue = 'ivan'

      pumpa.registerValue(key, nameValue, { tag })

      expect(() => pumpa.registerValue(key, nameValue, { tag })).toThrowError(
        `${key} with tag: ${tag}`
      )
    })

    test('Throw error if resolved key cannot be found', () => {
      const pumpa = new Pumpa()
      const key = 'name'

      expect(() => pumpa.resolve(key)).toThrowError(`${key}`)
    })

    test('Throw error if resolved key with a tag cannot be found', () => {
      const pumpa = new Pumpa()
      const key = 'name'
      const tag = 'some_tag'

      expect(() => pumpa.resolve(key, { tag })).toThrowError(
        `${key} with tag: ${tag}`
      )
    })
  })
})
