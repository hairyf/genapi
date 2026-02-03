import { describe, expect, it } from 'vitest'
import {
  spliceEnumDescription,
  spliceEnumType,
  useRefMap,
  varFiled,
  varName,
} from '../../src/utils/format'

describe('varName', () => {
  it('converts string to PascalCase and strips non-alphanumeric', () => {
    const single = varName('get pets')
    expect(single[0]).toBe(single[0].toUpperCase())
    expect(single).not.toMatch(/\s/)
    const array = varName(['get', 'pets'])
    expect(array[0]).toBe(array[0].toUpperCase())
    expect(typeof array).toBe('string')
  })
})

describe('useRefMap', () => {
  it('returns last segment of $ref', () => {
    expect(useRefMap('#/definitions/Pet')).toBe('Pet')
    expect(useRefMap('https://example.com/schemas/User')).toBe('User')
  })
})

describe('varFiled', () => {
  it('wraps non-identifier names in quotes', () => {
    expect(varFiled('my-param')).toBe('\'my-param\'')
    expect(varFiled('X-Request-ID')).toBe('\'X-Request-ID\'')
  })

  it('leaves valid identifiers unchanged', () => {
    expect(varFiled('petId')).toBe('petId')
    expect(varFiled('limit')).toBe('limit')
  })
})

describe('spliceEnumDescription', () => {
  it('returns empty string for empty enums', () => {
    expect(spliceEnumDescription('status', [])).toBe('')
  })

  it('returns @param description for enum values', () => {
    const result = spliceEnumDescription('status', ['a', 'b'])
    expect(result).toContain('@param')
    expect(result).toContain('status')
    expect(result).toContain('a')
    expect(result).toContain('b')
  })
})

describe('spliceEnumType', () => {
  it('returns empty string for empty enums', () => {
    expect(spliceEnumType([])).toBe('')
  })

  it('returns union type for enum values', () => {
    expect(spliceEnumType(['a', 'b'])).toContain('\'a\'')
    expect(spliceEnumType(['a', 'b'])).toContain('\'b\'')
    expect(spliceEnumType(['a', 'b'])).toContain('[]')
  })
})
