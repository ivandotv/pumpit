import { PumpIt } from '../pumpit'

describe('Bind values', () => {
  test('resolve value', () => {
    const pumpIt = new PumpIt()
    const key = 'name'
    const nameValue = 'ivan'

    pumpIt.bindValue(key, nameValue)
    const result = pumpIt.resolve(key)

    expect(result).toBe(nameValue)
  })

  test('throw if the key is already registered', () => {
    const pumpIt = new PumpIt()
    const key = 'name'
    const nameValue = 'ivan'

    pumpIt.bindValue(key, nameValue)

    expect(() => pumpIt.bindValue(key, nameValue)).toThrowError(`${key}`)
  })

  test('throw if the key to be resolved cannot be found', () => {
    const pumpIt = new PumpIt()
    const key = 'name'

    expect(() => pumpIt.resolve(key)).toThrowError(`${key}`)
  })
})
