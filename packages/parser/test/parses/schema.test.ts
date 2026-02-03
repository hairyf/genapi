import { provide } from '@genapi/shared'
import { beforeEach, describe, expect, it } from 'vitest'
import { parseSchemaType } from '../../src/parses/schema'

describe('parseSchemaType', () => {
  beforeEach(() => {
    provide({ interfaces: [] })
  })

  it('returns "any" for null/undefined', () => {
    expect(parseSchemaType(null as any)).toBe('any')
    expect(parseSchemaType(undefined as any)).toBe('any')
  })

  it('resolves $ref to definition name (varName)', () => {
    const schema = { $ref: '#/definitions/Pet' }
    expect(parseSchemaType(schema as any)).toBe('Pet')
  })

  it('parses object with properties to inline type', () => {
    const schema = {
      type: 'object',
      properties: {
        id: { type: 'integer' },
        name: { type: 'string' },
      },
    }
    expect(parseSchemaType(schema as any)).toContain('id')
    expect(parseSchemaType(schema as any)).toContain('number')
    expect(parseSchemaType(schema as any)).toContain('string')
  })

  it('parses array with items to itemsType[]', () => {
    const schema = {
      type: 'array',
      items: { type: 'string' },
    }
    expect(parseSchemaType(schema as any)).toBe('string[]')
  })

  it('parses array of refs', () => {
    const schema = {
      type: 'array',
      items: { $ref: '#/definitions/Pet' },
    }
    expect(parseSchemaType(schema as any)).toBe('Pet[]')
  })

  it('parses primitive types', () => {
    expect(parseSchemaType({ type: 'string' } as any)).toBe('string')
    expect(parseSchemaType({ type: 'boolean' } as any)).toBe('boolean')
    expect(parseSchemaType({ type: 'integer' } as any)).toBe('number')
    expect(parseSchemaType({ type: 'number' } as any)).toBe('number')
  })

  it('parses allOf composition and merges into interface', () => {
    provide({ interfaces: [] })
    const schema = {
      allOf: [
        { $ref: '#/definitions/ErrorModel' },
        {
          type: 'object',
          required: ['rootCause'],
          properties: { rootCause: { type: 'string' } },
        },
      ],
    }
    const name = parseSchemaType(schema as any)
    expect(name).toMatch(/AllOf/)
  })

  it('handles additionalProperties true as Record<string, any>', () => {
    expect(parseSchemaType({ type: 'object', additionalProperties: true } as any)).toBe('Record<string, any>')
  })

  it('handles additionalProperties schema as Record<string, T>', () => {
    expect(parseSchemaType({ type: 'object', additionalProperties: { type: 'string' } } as any)).toBe('Record<string, string>')
  })

  it('handles array items with enum', () => {
    const schema = {
      type: 'array',
      items: { type: 'string', enum: ['a', 'b'] },
    }
    const result = parseSchemaType(schema as any)
    expect(result).toContain('|')
    expect(result).toContain('[]')
  })

  it('returns definition name from originalRef (varName applied)', () => {
    provide({ interfaces: [] })
    const schema = { originalRef: '#/definitions/User' }
    const result = parseSchemaType(schema as any)
    expect(result).toContain('User')
    expect(typeof result).toBe('string')
  })

  it('unwraps nested .schema (e.g. body parameter)', () => {
    provide({ interfaces: [] })
    const schema = {
      schema: {
        type: 'object',
        properties: { id: { type: 'integer' } },
      },
    }
    const result = parseSchemaType(schema as any)
    expect(result).toContain('id')
    expect(result).toContain('number')
  })

  it('parses number formats (long, float, byte) as number', () => {
    expect(parseSchemaType({ type: 'long' } as any)).toBe('number')
    expect(parseSchemaType({ type: 'float' } as any)).toBe('number')
    expect(parseSchemaType({ type: 'byte' } as any)).toBe('number')
  })

  it('parses string formats (date, dateTime, password, binary) as string', () => {
    expect(parseSchemaType({ type: 'date' } as any)).toBe('string')
    expect(parseSchemaType({ type: 'dateTime' } as any)).toBe('string')
    expect(parseSchemaType({ type: 'password' } as any)).toBe('string')
    expect(parseSchemaType({ type: 'binary' } as any)).toBe('string')
  })

  it('parses type as array (union) to union string', () => {
    provide({ interfaces: [] })
    const schema = { type: ['string', 'null'] }
    const result = parseSchemaType(schema as any)
    expect(result).toContain('string')
  })

  it('returns any when type is missing', () => {
    expect(parseSchemaType({ properties: { x: { type: 'string' } } } as any)).toBe('any')
  })

  it('handles object with empty properties', () => {
    const schema = { type: 'object', properties: {} }
    const result = parseSchemaType(schema as any)
    expect(result).toBe('any')
  })

  it('wraps union type in parentheses in array items', () => {
    provide({ interfaces: [] })
    const schema = {
      type: 'array',
      items: { type: ['string', 'integer'] },
    }
    const result = parseSchemaType(schema as any)
    expect(result).toContain('(')
    expect(result).toContain(')')
    expect(result).toContain('[]')
  })

  it('handles array without items (edge case)', () => {
    provide({ interfaces: [] })
    const schema = { type: 'array' }
    const result = parseSchemaType(schema as any)
    expect(result).toContain('[]')
  })

  it('generates unique AllOf name when collision exists', () => {
    provide({ interfaces: [{ name: 'AllOfErrorModel', properties: [], export: true }] })
    const schema = {
      allOf: [
        { $ref: '#/definitions/ErrorModel' },
        { type: 'object', properties: { code: { type: 'integer' } } },
      ],
    }
    const result = parseSchemaType(schema as any)
    expect(result).toMatch(/AllOfErrorModel\d*/)
  })
})
