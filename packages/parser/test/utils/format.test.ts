import { describe, expect, it, vi } from 'vitest'
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

  it('handles empty/undefined input with console.trace', () => {
    // Mock console.trace to verify it's called
    // eslint-disable-next-line no-console
    const originalTrace = console.trace
    const traceSpy = vi.fn()
    // eslint-disable-next-line no-console
    console.trace = traceSpy

    const result1 = varName('' as any)
    const result2 = varName(undefined as any)
    const result3 = varName(null as any)

    // Should return the input value when falsy
    expect(result1).toBe('')
    expect(result2).toBeUndefined()
    expect(result3).toBeNull()
    // console.trace should be called for falsy values
    expect(traceSpy).toHaveBeenCalled()

    // eslint-disable-next-line no-console
    console.trace = originalTrace
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

  it('handles empty enums array with fallback values (line 44-45)', () => {
    // Test the fallback logic: enums?.join(',') || 'a,b,c' and enums?.map(...).join('&') || ...
    const result = spliceEnumDescription('status', [])
    expect(result).toBe('')
    // When enums is empty, the function returns early, so fallbacks aren't used
    // But we can test with undefined/null to trigger fallbacks
    const resultWithNull = spliceEnumDescription('status', null as any)
    expect(resultWithNull).toBe('')
  })

  it('handles single enum value without pipe separator', () => {
    const result = spliceEnumDescription('status', ['active'])
    expect(result).toContain('status')
    expect(result).toContain('active')
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

  it('handles single enum value without parentheses (line 57)', () => {
    // When stringTypes doesn't include '|', it should not wrap in parentheses
    const result = spliceEnumType(['single'])
    expect(result).toBe('\'single\'[]')
    expect(result).not.toContain('(')
  })

  it('wraps union type in parentheses when multiple values', () => {
    const result = spliceEnumType(['a', 'b', 'c'])
    expect(result).toContain('(')
    expect(result).toContain(')')
    expect(result).toContain('[]')
  })
})
