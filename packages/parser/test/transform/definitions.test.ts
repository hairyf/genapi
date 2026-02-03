import { provide } from '@genapi/shared'
import { beforeEach, describe, expect, it } from 'vitest'
import { transformDefinitions } from '../../src/transform/definitions'

describe('transformDefinitions', () => {
  beforeEach(() => {
    provide({ interfaces: [] })
  })

  it('pushes one interface per definition with varName and properties', () => {
    const interfaces: any[] = []
    provide({ interfaces })
    const definitions = {
      Category: {
        type: 'object',
        properties: {
          id: { type: 'integer', format: 'int64' },
          name: { type: 'string' },
        },
      },
    }
    transformDefinitions(definitions as any)
    expect(interfaces).toHaveLength(1)
    expect(interfaces[0].name).toBe('Category')
    expect(interfaces[0].export).toBe(true)
    expect(interfaces[0].properties).toHaveLength(2)
    const names = interfaces[0].properties.map((p: any) => p.name)
    expect(names).toContain('id')
    expect(names).toContain('name')
  })

  it('respects definition.required for required flag', () => {
    const interfaces: any[] = []
    provide({ interfaces })
    const definitions = {
      Pet: {
        type: 'object',
        required: ['name'],
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
        },
      },
    }
    transformDefinitions(definitions as any)
    const pet = interfaces.find((i: any) => i.name === 'Pet')
    expect(pet).toBeDefined()
    const nameField = pet!.properties.find((p: any) => p.name === 'name')
    expect(nameField?.required).toBe(true)
  })

  it('handles definition with empty properties', () => {
    const interfaces: any[] = []
    provide({ interfaces })
    const definitions = {
      Empty: { type: 'object', properties: {} },
    }
    transformDefinitions(definitions as any)
    expect(interfaces).toHaveLength(1)
    expect(interfaces[0].name).toBe('Empty')
    expect(interfaces[0].properties).toHaveLength(0)
  })

  it('handles $ref in definition properties', () => {
    const interfaces: any[] = []
    provide({ interfaces })
    const definitions = {
      Ref: {
        type: 'object',
        properties: {
          category: { $ref: '#/definitions/Category' },
        },
      },
      Category: {
        type: 'object',
        properties: { name: { type: 'string' } },
      },
    }
    transformDefinitions(definitions as any)
    const ref = interfaces.find((i: any) => i.name === 'Ref')
    expect(ref).toBeDefined()
    const catField = ref!.properties.find((p: any) => p.name === 'category')
    expect(catField?.type).toBe('Category')
  })
})
