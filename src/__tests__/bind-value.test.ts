import { describe, expect, test } from 'vitest'
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

    expect(() => pumpIt.bindValue(key, nameValue)).toThrow(`${key}`)
  })

  test('throw if the key to be resolved cannot be found', () => {
    const pumpIt = new PumpIt()
    const key = 'name'

    expect(() => pumpIt.resolve(key)).toThrow(`${key}`)
  })

  test('Bind and resolve falsy values', () => {
    const pumpit = new PumpIt()

    const stringValue = ''
    const undefinedValue = undefined
    const nullValue = null
    const falseValue = false

    pumpit.bindValue('string', stringValue)
    pumpit.bindValue('undefined', undefinedValue)
    pumpit.bindValue('null', nullValue)
    pumpit.bindValue('false', falseValue)

    expect(pumpit.resolve('string')).toBe(stringValue)
    expect(pumpit.resolve('undefined')).toBe(undefinedValue)
    expect(pumpit.resolve('null')).toBe(nullValue)
    expect(pumpit.resolve('false')).toBe(falseValue)
  })
})
