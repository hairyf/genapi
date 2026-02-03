import { describe, expect, it } from 'vitest'
import { literalFieldsToString } from '../../src/utils/literal'

describe('literalFieldsToString', () => {
  it('joins string fields with comma', () => {
    expect(literalFieldsToString(['a', 'b', 'c'])).toBe('a, b, c')
  })

  it('converts [key, value] to key:value', () => {
    expect(literalFieldsToString([['method', 'GET'], ['body', 'data']])).toBe('method:GET, body:data')
  })

  it('converts spread tuple to ...name', () => {
    expect(literalFieldsToString([['...', 'options']])).toBe('...options')
  })

  it('handles mixed string and tuple fields', () => {
    expect(literalFieldsToString(['method', ['body', 'data']])).toBe('method, body:data')
  })

  it('returns empty string for empty array', () => {
    expect(literalFieldsToString([])).toBe('')
  })
})
