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
      const tag = 'tag_name'
      const nameValue = 'ivan'

      pumpa.bindValue(key, nameValue, { tag })

      const result = pumpa.resolve(key, { tag })

      expect(result).toBe(nameValue)
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
