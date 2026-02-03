import { describe, expect, it } from 'vitest'
import { isRequiredParameter } from '../../src/utils/is'

describe('isRequiredParameter', () => {
  it('returns true when any field is required and not index signature and type not any', () => {
    expect(isRequiredParameter([
      { name: 'id', type: 'string', required: true },
    ])).toBe(true)
  })

  it('returns false when no field is required', () => {
    expect(isRequiredParameter([
      { name: 'limit', type: 'number', required: false },
    ])).toBe(false)
  })

  it('returns false when only field is index signature [key: string]', () => {
    expect(isRequiredParameter([
      { name: '[key: string]', type: 'any', required: true },
    ])).toBe(false)
  })

  it('returns false when required field has type ending with any', () => {
    expect(isRequiredParameter([
      { name: 'extra', type: 'any', required: true },
    ])).toBe(false)
  })

  it('returns true when one of multiple fields is required', () => {
    expect(isRequiredParameter([
      { name: 'a', type: 'string', required: false },
      { name: 'b', type: 'number', required: true },
    ])).toBe(true)
  })
})
