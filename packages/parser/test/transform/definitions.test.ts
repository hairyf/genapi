import type { ApiPipeline } from '@genapi/shared'
import { provide } from '@genapi/shared'
import { beforeEach, describe, expect, it } from 'vitest'
import { transformDefinitions } from '../../src/transform/definitions'

describe('transformDefinitions', () => {
  let configRead: ApiPipeline.ConfigRead
  let typeInterfaces: any[]

  beforeEach(() => {
    typeInterfaces = []
    configRead = {
      config: {
        input: '',
      } as ApiPipeline.Config,
      inputs: {},
      outputs: [],
      graphs: {
        scopes: { main: { comments: [], functions: [], imports: [], variables: [], typings: [], interfaces: [] }, type: { comments: [], functions: [], imports: [], variables: [], typings: [], interfaces: [] } },
        response: {},
      },
    }
    provide({
      configRead,
      interfaces: {
        add: (_scope: string, item: any) => { typeInterfaces.push(item) },
        values: (_s: string) => typeInterfaces,
        all: () => typeInterfaces,
      },
    })
  })

  it('pushes one interface per definition with varName and properties', () => {
    const block = {
      add: (_s: string, item: any) => { typeInterfaces.push(item) },
      values: (_s: string) => typeInterfaces,
      all: () => typeInterfaces,
    }
    provide({ configRead, interfaces: block })
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
    expect(typeInterfaces).toHaveLength(1)
    expect(typeInterfaces[0].name).toBe('Category')
    expect(typeInterfaces[0].export).toBe(true)
    expect(typeInterfaces[0].properties).toHaveLength(2)
    const names = typeInterfaces[0].properties.map((p: any) => p.name)
    expect(names).toContain('id')
    expect(names).toContain('name')
  })

  it('respects definition.required for required flag', () => {
    typeInterfaces = []
    const block = {
      add: (_s: string, item: any) => { typeInterfaces.push(item) },
      values: (_s: string) => typeInterfaces,
      all: () => typeInterfaces,
    }
    provide({ configRead, interfaces: block })
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
    const pet = typeInterfaces.find((i: any) => i.name === 'Pet')
    expect(pet).toBeDefined()
    const nameField = pet!.properties.find((p: any) => p.name === 'name')
    expect(nameField?.required).toBe(true)
  })

  it('handles definition with empty properties', () => {
    typeInterfaces = []
    const block = {
      add: (_s: string, item: any) => { typeInterfaces.push(item) },
      values: (_s: string) => typeInterfaces,
      all: () => typeInterfaces,
    }
    provide({ configRead, interfaces: block })
    const definitions = {
      Empty: { type: 'object', properties: {} },
    }
    transformDefinitions(definitions as any)
    expect(typeInterfaces).toHaveLength(1)
    expect(typeInterfaces[0].name).toBe('Empty')
    expect(typeInterfaces[0].properties).toHaveLength(0)
  })

  it('handles definition without properties (undefined)', () => {
    typeInterfaces = []
    provide({ configRead, interfaces: { add: (_s: string, item: any) => typeInterfaces.push(item), values: (_s: string) => typeInterfaces, all: () => typeInterfaces } })
    const definitions = {
      NoProps: { type: 'object' }, // No properties field
    }
    transformDefinitions(definitions as any)
    expect(typeInterfaces).toHaveLength(1)
    expect(typeInterfaces[0].name).toBe('NoProps')
    expect(typeInterfaces[0].properties).toHaveLength(0)
  })

  it('handles definition with property that has boolean required field', () => {
    typeInterfaces = []
    provide({ configRead, interfaces: { add: (_s: string, item: any) => typeInterfaces.push(item), values: (_s: string) => typeInterfaces, all: () => typeInterfaces } })
    const definitions = {
      Test: {
        type: 'object',
        properties: {
          id: { type: 'integer', required: true },
          name: { type: 'string', required: false },
        },
      },
    }
    transformDefinitions(definitions as any)
    const testInterface = typeInterfaces.find((i: any) => i.name === 'Test')
    expect(testInterface).toBeDefined()
    const idField = testInterface!.properties.find((p: any) => p.name === 'id')
    const nameField = testInterface!.properties.find((p: any) => p.name === 'name')
    expect(idField?.required).toBe(true)
    expect(nameField?.required).toBe(false)
  })

  it('handles definition with property description', () => {
    typeInterfaces = []
    provide({ configRead, interfaces: { add: (_s: string, item: any) => typeInterfaces.push(item), values: (_s: string) => typeInterfaces, all: () => typeInterfaces } })
    const definitions = {
      Test: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'The unique identifier' },
        },
      },
    }
    transformDefinitions(definitions as any)
    const testInterface = typeInterfaces.find((i: any) => i.name === 'Test')
    expect(testInterface).toBeDefined()
    const idField = testInterface!.properties.find((p: any) => p.name === 'id')
    expect(idField?.description).toBe('@description The unique identifier')
  })

  it('handles $ref in definition properties', () => {
    typeInterfaces = []
    provide({ configRead, interfaces: { add: (_s: string, item: any) => typeInterfaces.push(item), values: (_s: string) => typeInterfaces, all: () => typeInterfaces } })
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
    const ref = typeInterfaces.find((i: any) => i.name === 'Ref')
    expect(ref).toBeDefined()
    const catField = ref!.properties.find((p: any) => p.name === 'category')
    expect(catField?.type).toBe('Category')
  })

  describe('patch.definitions', () => {
    it('renames interface when patch renames definition with string', () => {
      typeInterfaces = []
      provide({ configRead, interfaces: { add: (_s: string, item: any) => typeInterfaces.push(item), values: (_s: string) => typeInterfaces, all: () => typeInterfaces } })
      configRead.config.patch = {
        definitions: {
          UserDto: 'User',
        },
      }

      const definitions = {
        UserDto: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
          },
        },
      }
      transformDefinitions(definitions as any)

      // Interface renamed to User
      expect(typeInterfaces.find((i: any) => i.name === 'User')).toBeDefined()
      expect(typeInterfaces.find((i: any) => i.name === 'UserDto')).toBeUndefined()
    })

    it('applies name and type when patch provides both', () => {
      typeInterfaces = []
      provide({ configRead, interfaces: { add: (_s: string, item: any) => typeInterfaces.push(item), values: (_s: string) => typeInterfaces, all: () => typeInterfaces } })
      configRead.config.patch = {
        definitions: {
          SessionDto: {
            name: 'Session',
            type: [{ name: 'name', type: 'string' }, { name: 'age', type: 'number' }],
          },
        },
      }

      const definitions = {
        SessionDto: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            token: { type: 'string' },
          },
        },
      }
      transformDefinitions(definitions as any)

      // Interface renamed to Session with patch type as properties
      const session = typeInterfaces.find((i: any) => i.name === 'Session')
      expect(session).toBeDefined()
      expect(session!.properties).toHaveLength(2)
      expect(session!.properties.map((p: any) => p.name)).toEqual(['name', 'age'])
      expect(typeInterfaces.find((i: any) => i.name === 'SessionDto')).toBeUndefined()
    })

    it('handles multiple definition patches', () => {
      typeInterfaces = []
      provide({ configRead, interfaces: { add: (_s: string, item: any) => typeInterfaces.push(item), values: (_s: string) => typeInterfaces, all: () => typeInterfaces } })
      configRead.config.patch = {
        definitions: {
          UserDto: 'User',
          OrderDto: 'Order',
        },
      }

      const definitions = {
        UserDto: {
          type: 'object',
          properties: { id: { type: 'integer' } },
        },
        OrderDto: {
          type: 'object',
          properties: { id: { type: 'integer' } },
        },
      }
      transformDefinitions(definitions as any)

      // Interfaces renamed
      expect(typeInterfaces.find((i: any) => i.name === 'User')).toBeDefined()
      expect(typeInterfaces.find((i: any) => i.name === 'Order')).toBeDefined()
    })

    it('renames interface when patch matches transformed name', () => {
      typeInterfaces = []
      provide({ configRead, interfaces: { add: (_s: string, item: any) => typeInterfaces.push(item), values: (_s: string) => typeInterfaces, all: () => typeInterfaces } })
      configRead.config.transform = {
        operation: () => '',
        definition: (name) => {
          if (name === 'UserDto')
            return 'User'
          return name
        },
      }
      configRead.config.patch = {
        definitions: {
          User: 'UserAlias', // Patch targets transformed name
        },
      }

      const definitions = {
        UserDto: {
          type: 'object',
          properties: { id: { type: 'integer' } },
        },
      }
      transformDefinitions(definitions as any)

      // Interface renamed to UserAlias (transform: UserDto -> User, patch: User -> UserAlias)
      expect(typeInterfaces.find((i: any) => i.name === 'UserAlias')).toBeDefined()
    })

    it('renames interface when patch only renames', () => {
      typeInterfaces = []
      provide({ configRead, interfaces: { add: (_s: string, item: any) => typeInterfaces.push(item), values: (_s: string) => typeInterfaces, all: () => typeInterfaces } })
      configRead.config.patch = {
        definitions: {
          PetDto: 'Pet',
        },
      }

      const definitions = {
        PetDto: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
          },
        },
      }
      transformDefinitions(definitions as any)

      // Interface renamed to Pet
      const renamedInterface = typeInterfaces.find((i: any) => i.name === 'Pet')
      expect(renamedInterface).toBeDefined()
      expect(renamedInterface!.properties).toHaveLength(2)
      expect(typeInterfaces.find((i: any) => i.name === 'PetDto')).toBeUndefined()
    })
  })

  describe('transform.definition', () => {
    it('applies global transform before static patch', () => {
      typeInterfaces = []
      provide({ configRead, interfaces: { add: (_s: string, item: any) => typeInterfaces.push(item), values: (_s: string) => typeInterfaces, all: () => typeInterfaces } })
      configRead.config.transform = {
        operation: () => '',
        definition: (name) => {
          // Remove 'Dto' suffix
          if (name.endsWith('Dto'))
            return name.slice(0, -3)
          return name
        },
      }
      configRead.config.patch = {
        definitions: {
          User: 'UserEntity', // Patch targets transformed name
        },
      }

      const definitions = {
        UserDto: {
          type: 'object',
          properties: { id: { type: 'integer' } },
        },
      }
      transformDefinitions(definitions as any)

      // Transform: UserDto -> User
      // Patch: User -> UserEntity
      expect(typeInterfaces.find((i: any) => i.name === 'UserEntity')).toBeDefined()
      expect(typeInterfaces.find((i: any) => i.name === 'User')).toBeUndefined()
      expect(typeInterfaces.find((i: any) => i.name === 'UserDto')).toBeUndefined()
    })

    it('renames interface when transform returns string', () => {
      typeInterfaces = []
      provide({ configRead, interfaces: { add: (_s: string, item: any) => typeInterfaces.push(item), values: (_s: string) => typeInterfaces, all: () => typeInterfaces } })
      configRead.config.transform = {
        operation: () => '',
        definition: () => 'RenamedType',
      }

      const definitions = {
        OriginalType: {
          type: 'object',
          properties: { id: { type: 'integer' } },
        },
      }
      transformDefinitions(definitions as any)

      // Interface renamed to RenamedType
      expect(typeInterfaces.find((i: any) => i.name === 'RenamedType')).toBeDefined()
      expect(typeInterfaces.find((i: any) => i.name === 'OriginalType')).toBeUndefined()
    })

    it('applies name and type when transform returns object with type', () => {
      typeInterfaces = []
      provide({ configRead, interfaces: { add: (_s: string, item: any) => typeInterfaces.push(item), values: (_s: string) => typeInterfaces, all: () => typeInterfaces } })
      configRead.config.transform = {
        operation: () => '',
        definition: (name) => {
          return {
            name: `${name}Alias`,
            type: [{ name: 'id', type: 'integer' }],
          }
        },
      }

      const definitions = {
        Test: {
          type: 'object',
          properties: { id: { type: 'integer' } },
        },
      }
      transformDefinitions(definitions as any)

      // Interface renamed to TestAlias with transform type as properties
      const testAlias = typeInterfaces.find((i: any) => i.name === 'TestAlias')
      expect(testAlias).toBeDefined()
      expect(testAlias!.properties).toHaveLength(1)
      expect(testAlias!.properties[0]).toEqual({ name: 'id', type: 'integer', required: undefined, description: undefined })
    })

    it('keeps interface unchanged when transform returns same name and type', () => {
      typeInterfaces = []
      provide({ configRead, interfaces: { add: (_s: string, item: any) => typeInterfaces.push(item), values: (_s: string) => typeInterfaces, all: () => typeInterfaces } })
      configRead.config.transform = {
        operation: () => '',
        definition: (name, properties) => ({ name, type: properties }), // No-op transform
      }

      const definitions = {
        Unchanged: {
          type: 'object',
          properties: { id: { type: 'integer' } },
        },
      }
      transformDefinitions(definitions as any)

      expect(typeInterfaces.find((i: any) => i.name === 'Unchanged')).toBeDefined()
      expect(typeInterfaces.find((i: any) => i.name === 'Unchanged')!.properties).toHaveLength(1)
    })

    it('handles patch with only name (no type)', () => {
      typeInterfaces = []
      provide({ configRead, interfaces: { add: (_s: string, item: any) => typeInterfaces.push(item), values: (_s: string) => typeInterfaces, all: () => typeInterfaces } })
      configRead.config.patch = {
        definitions: {
          OldName: {
            name: 'NewName',
            // No type provided
          },
        },
      }

      const definitions = {
        OldName: {
          type: 'object',
          properties: { id: { type: 'integer' } },
        },
      }
      transformDefinitions(definitions as any)

      const renamed = typeInterfaces.find((i: any) => i.name === 'NewName')
      expect(renamed).toBeDefined()
      expect(renamed!.properties).toHaveLength(1) // Properties preserved
    })

    it('handles patch with only type (no name)', () => {
      typeInterfaces = []
      provide({ configRead, interfaces: { add: (_s: string, item: any) => typeInterfaces.push(item), values: (_s: string) => typeInterfaces, all: () => typeInterfaces } })
      configRead.config.patch = {
        definitions: {
          Original: {
            type: [{ name: 'custom', type: 'string' }],
            // No name provided
          },
        },
      }

      const definitions = {
        Original: {
          type: 'object',
          properties: { id: { type: 'integer' } },
        },
      }
      transformDefinitions(definitions as any)

      const patched = typeInterfaces.find((i: any) => i.name === 'Original')
      expect(patched).toBeDefined()
      expect(patched!.properties).toHaveLength(1)
      expect(patched!.properties[0].name).toBe('custom')
    })
  })

  it('handles configRead without config (undefined)', () => {
    typeInterfaces = []
    provide({
      configRead: undefined as any,
      interfaces: { add: (_s: string, item: any) => typeInterfaces.push(item), values: (_s: string) => typeInterfaces, all: () => typeInterfaces },
    })
    const definitions = {
      Test: {
        type: 'object',
        properties: { id: { type: 'integer' } },
      },
    }
    transformDefinitions(definitions as any)
    expect(typeInterfaces).toHaveLength(1)
    expect(typeInterfaces[0].name).toBe('Test')
  })
})
