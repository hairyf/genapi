import { provide } from '@genapi/shared'
import { describe, expect, it } from 'vitest'
import { parseParameterFiled } from '../../src/parses/parameter'

describe('parseParameterFiled', () => {
  it('parses path parameter with type and description', () => {
    provide({ interfaces: [] })
    const param = {
      name: 'petId',
      in: 'path' as const,
      required: true,
      type: 'string' as const,
      description: 'ID of pet',
    }
    const field = parseParameterFiled(param as any)
    expect(field.name).toBe('petId')
    expect(field.type).toBe('string')
    expect(field.required).toBe(true)
    expect(field.description).toContain('ID of pet')
  })

  it('parses query integer parameter', () => {
    provide({ interfaces: [] })
    const param = {
      name: 'limit',
      in: 'query' as const,
      type: 'integer' as const,
      format: 'int32',
    }
    const field = parseParameterFiled(param as any)
    expect(field.type).toBe('number')
  })

  it('parses query array parameter with items', () => {
    provide({ interfaces: [] })
    const param = {
      name: 'tags',
      in: 'query' as const,
      type: 'array' as const,
      items: { type: 'string' as const },
    }
    const field = parseParameterFiled(param as any)
    expect(field.type).toBe('string[]')
  })

  it('parses header parameter', () => {
    provide({ interfaces: [] })
    const param = {
      name: 'X-Request-ID',
      in: 'header' as const,
      type: 'string' as const,
    }
    const field = parseParameterFiled(param as any)
    expect(field.type).toBe('string')
  })

  it('parses body parameter with schema', () => {
    provide({ interfaces: [] })
    const param = {
      name: 'body',
      in: 'body' as const,
      required: true,
      schema: {
        type: 'object' as const,
        properties: {
          name: { type: 'string' as const },
        },
      },
    }
    const field = parseParameterFiled(param as any)
    expect(field.type).toContain('name')
    expect(field.required).toBe(true)
  })

  it('parses formData file parameter', () => {
    provide({ interfaces: [] })
    const param = {
      name: 'avatar',
      in: 'formData' as const,
      required: true,
      type: 'file' as const,
    }
    const field = parseParameterFiled(param as any)
    expect(field.type).toBe('any')
    expect(field.required).toBe(true)
  })

  it('sanitizes parameter name for invalid identifiers', () => {
    provide({ interfaces: [] })
    const param = { name: 'my-param', in: 'query' as const, type: 'string' as const }
    const field = parseParameterFiled(param as any)
    expect(field.name).toBe('\'my-param\'')
  })

  it('parses cookie parameter', () => {
    provide({ interfaces: [] })
    const param = { name: 'session', in: 'cookie' as const, type: 'string' as const }
    const field = parseParameterFiled(param as any)
    expect(field.type).toBe('string')
  })

  it('parses querystring parameter', () => {
    provide({ interfaces: [] })
    const param = { name: 'filter', in: 'querystring' as const, type: 'string' as const }
    const field = parseParameterFiled(param as any)
    expect(field.type).toBe('string')
  })

  it('parses query array with collectionFormat ssv', () => {
    provide({ interfaces: [] })
    const param = {
      name: 'ids',
      in: 'query' as const,
      type: 'array' as const,
      items: { type: 'string' as const },
      collectionFormat: 'ssv',
    }
    const field = parseParameterFiled(param as any)
    expect(field.type).toBe('string[]')
  })

  it('parses optional parameter (required false)', () => {
    provide({ interfaces: [] })
    const param = { name: 'skip', in: 'query' as const, type: 'integer' as const, required: false }
    const field = parseParameterFiled(param as any)
    expect(field.required).toBe(false)
  })

  it('parses parameter with default value', () => {
    provide({ interfaces: [] })
    const param = { name: 'limit', in: 'query' as const, type: 'integer' as const, default: 10 }
    const field = parseParameterFiled(param as any)
    expect(field.type).toBe('number')
  })

  it('oAS 3: parses parameter with schema instead of type', () => {
    provide({ interfaces: [] })
    const param = {
      name: 'limit',
      in: 'query' as const,
      schema: { type: 'integer', default: 10 },
    }
    const field = parseParameterFiled(param as any)
    expect(field.type).toBe('number')
  })

  it('oAS 3: parses parameter with schema (array of refs)', () => {
    provide({ interfaces: [] })
    const param = {
      name: 'ids',
      in: 'query' as const,
      schema: { type: 'array', items: { $ref: '#/components/schemas/Id' } },
    }
    const field = parseParameterFiled(param as any)
    expect(field.type).toContain('[]')
  })

  it('omits description when empty', () => {
    provide({ interfaces: [] })
    const param = { name: 'id', in: 'path' as const, required: true, type: 'string' as const }
    const field = parseParameterFiled(param as any)
    expect(field.description).toBeUndefined()
    const withEmpty = { ...param, description: '' }
    const f2 = parseParameterFiled(withEmpty as any)
    expect(f2.description).toBeUndefined()
  })
})
