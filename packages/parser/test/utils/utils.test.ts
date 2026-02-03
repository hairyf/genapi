import { describe, expect, it } from 'vitest'
import { fillParameters, isParameter, replaceMainext, toUndefField } from '../../src/utils/utils'

describe('isParameter', () => {
  it('returns true for object with name and in', () => {
    expect(isParameter({ name: 'id', in: 'path' })).toBe(true)
    expect(isParameter({ name: 'q', in: 'query', type: 'string' })).toBe(true)
  })

  it('returns false for $ref only', () => {
    expect(isParameter({ $ref: '#/parameters/Id' })).toBe(false)
  })

  it('returns false for null or undefined', () => {
    expect(isParameter(null as any)).toBe(false)
    expect(isParameter(undefined as any)).toBe(false)
  })
})

describe('toUndefField', () => {
  it('returns default schema name for in type', () => {
    expect(toUndefField('path')).toBe('paths')
    expect(toUndefField('query')).toBe('query')
    expect(toUndefField('body')).toBe('body')
    expect(toUndefField('header')).toBe('headers')
    expect(toUndefField('formData')).toBe('body')
    expect(toUndefField('cookie')).toBe('headers')
    expect(toUndefField('querystring')).toBe('query')
  })

  it('returns custom name when schemas override', () => {
    expect(toUndefField('query', { query: 'params' })).toBe('params')
    expect(toUndefField('body', { body: 'data' })).toBe('data')
  })

  it('returns query for unknown in type (fallback)', () => {
    expect((toUndefField as (a: string, b?: any) => string)('unknown' as any)).toBe('query')
  })
})

describe('fillParameters', () => {
  it('merges path params with operation params, operation overrides', () => {
    const pathParams = [
      { name: 'id', in: 'path' as const, required: true, type: 'string' as const },
    ]
    const options = {
      parameters: [
        { name: 'id', in: 'path' as const, required: true, type: 'integer' as const },
        { name: 'limit', in: 'query' as const, type: 'integer' as const },
      ],
      responses: {},
    }
    const result = fillParameters(options as any, pathParams as any)
    expect(result).toHaveLength(2)
    expect(result[0].name).toBe('id')
    expect(result[0].type).toBe('integer')
    expect(result[1].name).toBe('limit')
  })

  it('keeps only path params when operation has no parameters', () => {
    const pathParams = [{ name: 'id', in: 'path' as const, required: true, type: 'string' as const }]
    const options = { parameters: [], responses: {} }
    const result = fillParameters(options as any, pathParams as any)
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('id')
  })
})

describe('replaceMainext', () => {
  it('replaces .ts with .js when ext is js', () => {
    expect(replaceMainext('src/api.ts', 'js')).toBe('src/api.js')
  })

  it('replaces .js with .ts when ext is ts', () => {
    expect(replaceMainext('src/api.js', 'ts')).toBe('src/api.ts')
  })

  it('replaces output.main when output is object', () => {
    expect(replaceMainext({ main: 'dist/api.ts' } as any, 'js')).toBe('dist/api.js')
  })
})
