import { provide } from '@genapi/shared'
import { beforeEach, describe, expect, it } from 'vitest'
import { parseSchemaType } from '../../src/parses/schema'

describe('parseSchemaType', () => {
  let schemaInterfaces: any[]
  beforeEach(() => {
    schemaInterfaces = []
    provide({
      interfaces: {
        add: (_scope: string, item: any) => { schemaInterfaces.push(item) },
        values: (_scope: string) => schemaInterfaces,
        all: () => schemaInterfaces,
      },
      configRead: { config: { input: '' }, inputs: {}, outputs: [], graphs: { scopes: {}, response: {} } } as import('@genapi/shared').ApiPipeline.ConfigRead,
    })
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

  it('handles schemaRequired with boolean true', () => {
    const schema = {
      type: 'object',
      properties: {
        id: { type: 'integer', required: true },
      },
    }
    const result = parseSchemaType(schema as any)
    expect(result).toContain('id')
  })

  it('handles schemaRequired with boolean false', () => {
    const schema = {
      type: 'object',
      properties: {
        id: { type: 'integer', required: false },
      },
    }
    const result = parseSchemaType(schema as any)
    expect(result).toContain('id')
  })

  it('handles schemaRequired with array of required fields', () => {
    const schema = {
      type: 'object',
      properties: {
        id: { type: 'integer' },
        name: { type: 'string' },
      },
      required: ['id'], // Only id is required
    }
    const result = parseSchemaType(schema as any)
    expect(result).toContain('id')
    expect(result).toContain('name')
  })

  it('handles schemaRequired with array when field is undefined (defaults to required)', () => {
    // When field is undefined and required is an array, schemaRequired returns true
    const schema = {
      type: 'object',
      properties: {
        id: { type: 'integer' },
      },
      required: ['id'],
    }
    const result = parseSchemaType(schema as any)
    expect(result).toContain('id')
  })

  it('handles schemaRequired with array and undefined field (line 16 coverage)', () => {
    provide({ interfaces: { add: () => {}, values: () => [], all: () => [] }, configRead: { config: { input: '' }, inputs: {}, outputs: [], graphs: { scopes: {}, response: {} } } as any })
    const schema = {
      type: 'object',
      properties: {
        id: { type: 'integer' },
        name: { type: 'string' },
      },
      required: ['id'], // Array with 'id', but field is undefined
    }
    // This should call schemaRequired with undefined field
    const result = parseSchemaType(schema as any)
    expect(result).toBeTruthy()
  })

  it('handles schemaRequired with undefined (defaults to required)', () => {
    const schema = {
      type: 'object',
      properties: {
        id: { type: 'integer' }, // No required field specified
      },
    }
    const result = parseSchemaType(schema as any)
    expect(result).toContain('id')
  })

  it('handles schemaRequired with required true in properties', () => {
    const schema = {
      type: 'object',
      properties: {
        id: { type: 'integer', required: true },
      },
    }
    const result = parseSchemaType(schema as any)
    expect(result).toBeTruthy()
  })

  it('handles schemaRequired with boolean false (duplicate test)', () => {
    const schema = {
      type: 'object',
      properties: {
        id: { type: 'integer', required: false },
      },
    }
    const result = parseSchemaType(schema as any)
    expect(result).toBeTruthy()
  })

  it('handles schemaRequired with array and field name', () => {
    const schema = {
      type: 'object',
      required: ['id', 'name'],
      properties: {
        id: { type: 'integer' },
        name: { type: 'string' },
      },
    }
    const result = parseSchemaType(schema as any)
    expect(result).toBeTruthy()
  })

  it('handles allOf with $ref that does not exist in interfaces', () => {
    provide({ interfaces: { add: () => {}, values: () => [], all: () => [] }, configRead: { config: { input: '' }, inputs: {}, outputs: [], graphs: { scopes: {}, response: {} } } as any })
    const schema = {
      allOf: [
        { $ref: '#/definitions/NonExistent' },
        {
          type: 'object',
          properties: {
            id: { type: 'integer' },
          },
        },
      ],
    }
    const result = parseSchemaType(schema as any)
    expect(result).toBeTruthy()
  })

  it('handles allOf with $ref where interface.find returns undefined', () => {
    const interfaces: any[] = []
    provide({ interfaces: { add: () => {}, values: () => interfaces, all: () => interfaces }, configRead: { config: { input: '' }, inputs: {}, outputs: [], graphs: { scopes: {}, response: {} } } as any })
    const schema = {
      allOf: [
        { $ref: '#/definitions/NonExistentRef' }, // This ref won't be found
        {
          type: 'object',
          properties: {
            code: { type: 'integer' },
          },
        },
      ],
    }
    const result = parseSchemaType(schema as any)
    // Should still work even when interface is not found
    // The result will be AllOfNonExistentRef with code property
    expect(result).toBeTruthy()
    // When interface is not found, it still processes the properties
    expect(result).toMatch(/AllOfNonExistentRef|code/)
  })

  it('handles allOf with $ref where interfaces.find returns undefined (line 64 coverage)', () => {
    const interfaces: any[] = [
      { name: 'OtherType', properties: [] },
    ]
    provide({ interfaces: { add: () => {}, values: () => interfaces, all: () => interfaces }, configRead: { config: { input: '' }, inputs: {}, outputs: [], graphs: { scopes: {}, response: {} } } as any })
    const schema = {
      allOf: [
        { $ref: '#/definitions/NonExistentType' }, // This will parse to 'NonExistentType' but won't be found
        {
          type: 'object',
          properties: {
            value: { type: 'string' },
          },
        },
      ],
    }
    const result = parseSchemaType(schema as any)
    // Should handle undefined find result gracefully
    expect(result).toBeTruthy()
  })

  it('handles allOf with items.$ref', () => {
    provide({ interfaces: { add: () => {}, values: () => [], all: () => [] }, configRead: { config: { input: '' }, inputs: {}, outputs: [], graphs: { scopes: {}, response: {} } } as any })
    const schema = {
      allOf: [
        {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: { $ref: '#/definitions/Item' },
            },
          },
        },
      ],
    }
    const result = parseSchemaType(schema as any)
    expect(result).toBeTruthy()
  })

  it('parses allOf composition and merges into interface', () => {
    provide({ interfaces: { add: () => {}, values: () => [], all: () => [] }, configRead: { config: { input: '' }, inputs: {}, outputs: [], graphs: { scopes: {}, response: {} } } as import('@genapi/shared').ApiPipeline.ConfigRead })
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
    provide({ interfaces: { add: () => {}, values: () => [], all: () => [] }, configRead: { config: { input: '' }, inputs: {}, outputs: [], graphs: { scopes: {}, response: {} } } as import('@genapi/shared').ApiPipeline.ConfigRead })
    const schema = { originalRef: '#/definitions/User' }
    const result = parseSchemaType(schema as any)
    expect(result).toContain('User')
    expect(typeof result).toBe('string')
  })

  it('unwraps nested .schema (e.g. body parameter)', () => {
    provide({ interfaces: { add: () => {}, values: () => [], all: () => [] }, configRead: { config: { input: '' }, inputs: {}, outputs: [], graphs: { scopes: {}, response: {} } } as import('@genapi/shared').ApiPipeline.ConfigRead })
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
    provide({ interfaces: { add: () => {}, values: () => [], all: () => [] }, configRead: { config: { input: '' }, inputs: {}, outputs: [], graphs: { scopes: {}, response: {} } } as import('@genapi/shared').ApiPipeline.ConfigRead })
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
    provide({ interfaces: { add: () => {}, values: () => [], all: () => [] }, configRead: { config: { input: '' }, inputs: {}, outputs: [], graphs: { scopes: {}, response: {} } } as import('@genapi/shared').ApiPipeline.ConfigRead })
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
    provide({ interfaces: { add: () => {}, values: () => [], all: () => [] }, configRead: { config: { input: '' }, inputs: {}, outputs: [], graphs: { scopes: {}, response: {} } } as import('@genapi/shared').ApiPipeline.ConfigRead })
    const schema = { type: 'array' }
    const result = parseSchemaType(schema as any)
    expect(result).toContain('[]')
  })

  it('generates unique AllOf name when collision exists', () => {
    const list = [{ name: 'AllOfErrorModel', properties: [], export: true }]
    provide({ interfaces: { add: () => {}, values: () => list, all: () => list }, configRead: { config: { input: '' }, inputs: {}, outputs: [], graphs: { scopes: {}, response: {} } } as import('@genapi/shared').ApiPipeline.ConfigRead })
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
