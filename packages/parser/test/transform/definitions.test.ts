import type { ApiPipeline } from '@genapi/shared'
import { provide } from '@genapi/shared'
import { beforeEach, describe, expect, it } from 'vitest'
import { transformDefinitions } from '../../src/transform/definitions'

describe('transformDefinitions', () => {
  let configRead: ApiPipeline.ConfigRead

  beforeEach(() => {
    configRead = {
      config: {
        input: '',
      } as ApiPipeline.Config,
      inputs: {},
      outputs: [],
      graphs: {
        comments: [],
        functions: [],
        imports: [],
        interfaces: [],
        typings: [],
        variables: [],
        response: {},
      },
    }
    provide({ interfaces: [], configRead })
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

  it('handles definition without properties (undefined)', () => {
    const interfaces: any[] = []
    provide({ interfaces, configRead })
    const definitions = {
      NoProps: { type: 'object' }, // No properties field
    }
    transformDefinitions(definitions as any)
    expect(interfaces).toHaveLength(1)
    expect(interfaces[0].name).toBe('NoProps')
    expect(interfaces[0].properties).toHaveLength(0)
  })

  it('handles definition with property that has boolean required field', () => {
    const interfaces: any[] = []
    provide({ interfaces, configRead })
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
    const testInterface = interfaces.find((i: any) => i.name === 'Test')
    expect(testInterface).toBeDefined()
    const idField = testInterface!.properties.find((p: any) => p.name === 'id')
    const nameField = testInterface!.properties.find((p: any) => p.name === 'name')
    expect(idField?.required).toBe(true)
    expect(nameField?.required).toBe(false)
  })

  it('handles definition with property description', () => {
    const interfaces: any[] = []
    provide({ interfaces, configRead })
    const definitions = {
      Test: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'The unique identifier' },
        },
      },
    }
    transformDefinitions(definitions as any)
    const testInterface = interfaces.find((i: any) => i.name === 'Test')
    expect(testInterface).toBeDefined()
    const idField = testInterface!.properties.find((p: any) => p.name === 'id')
    expect(idField?.description).toBe('@description The unique identifier')
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

  describe('patch.definitions', () => {
    it('renames interface when patch renames definition with string', () => {
      const interfaces: any[] = []
      provide({ interfaces, configRead })
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
      expect(interfaces.find((i: any) => i.name === 'User')).toBeDefined()
      expect(interfaces.find((i: any) => i.name === 'UserDto')).toBeUndefined()
    })

    it('applies name and type when patch provides both', () => {
      const interfaces: any[] = []
      provide({ interfaces, configRead })
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
      const session = interfaces.find((i: any) => i.name === 'Session')
      expect(session).toBeDefined()
      expect(session!.properties).toHaveLength(2)
      expect(session!.properties.map((p: any) => p.name)).toEqual(['name', 'age'])
      expect(interfaces.find((i: any) => i.name === 'SessionDto')).toBeUndefined()
    })

    it('handles multiple definition patches', () => {
      const interfaces: any[] = []
      provide({ interfaces, configRead })
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
      expect(interfaces.find((i: any) => i.name === 'User')).toBeDefined()
      expect(interfaces.find((i: any) => i.name === 'Order')).toBeDefined()
    })

    it('renames interface when patch matches transformed name', () => {
      const interfaces: any[] = []
      provide({ interfaces, configRead })
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
      expect(interfaces.find((i: any) => i.name === 'UserAlias')).toBeDefined()
    })

    it('renames interface when patch only renames', () => {
      const interfaces: any[] = []
      provide({ interfaces, configRead })
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
      const renamedInterface = interfaces.find((i: any) => i.name === 'Pet')
      expect(renamedInterface).toBeDefined()
      expect(renamedInterface!.properties).toHaveLength(2)
      expect(interfaces.find((i: any) => i.name === 'PetDto')).toBeUndefined()
    })
  })

  describe('transform.definition', () => {
    it('applies global transform before static patch', () => {
      const interfaces: any[] = []
      provide({ interfaces, configRead })
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
      expect(interfaces.find((i: any) => i.name === 'UserEntity')).toBeDefined()
      expect(interfaces.find((i: any) => i.name === 'User')).toBeUndefined()
      expect(interfaces.find((i: any) => i.name === 'UserDto')).toBeUndefined()
    })

    it('renames interface when transform returns string', () => {
      const interfaces: any[] = []
      provide({ interfaces, configRead })
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
      expect(interfaces.find((i: any) => i.name === 'RenamedType')).toBeDefined()
      expect(interfaces.find((i: any) => i.name === 'OriginalType')).toBeUndefined()
    })

    it('applies name and type when transform returns object with type', () => {
      const interfaces: any[] = []
      provide({ interfaces, configRead })
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
      const testAlias = interfaces.find((i: any) => i.name === 'TestAlias')
      expect(testAlias).toBeDefined()
      expect(testAlias!.properties).toHaveLength(1)
      expect(testAlias!.properties[0]).toEqual({ name: 'id', type: 'integer', required: undefined, description: undefined })
    })

    it('keeps interface unchanged when transform returns same name and type', () => {
      const interfaces: any[] = []
      provide({ interfaces, configRead })
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

      expect(interfaces.find((i: any) => i.name === 'Unchanged')).toBeDefined()
      expect(interfaces.find((i: any) => i.name === 'Unchanged')!.properties).toHaveLength(1)
    })

    it('handles patch with only name (no type)', () => {
      const interfaces: any[] = []
      provide({ interfaces, configRead })
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

      const renamed = interfaces.find((i: any) => i.name === 'NewName')
      expect(renamed).toBeDefined()
      expect(renamed!.properties).toHaveLength(1) // Properties preserved
    })

    it('handles patch with only type (no name)', () => {
      const interfaces: any[] = []
      provide({ interfaces, configRead })
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

      const patched = interfaces.find((i: any) => i.name === 'Original')
      expect(patched).toBeDefined()
      expect(patched!.properties).toHaveLength(1)
      expect(patched!.properties[0].name).toBe('custom')
    })
  })

  it('handles configRead without config (undefined)', () => {
    const interfaces: any[] = []
    provide({ interfaces, configRead: undefined as any })
    const definitions = {
      Test: {
        type: 'object',
        properties: { id: { type: 'integer' } },
      },
    }
    transformDefinitions(definitions as any)
    // Should not crash when configRead is undefined
    expect(interfaces).toHaveLength(1)
    expect(interfaces[0].name).toBe('Test')
  })
})
