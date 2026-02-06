import type { ApiPipeline } from '@genapi/shared'
import { describe, expect, it } from 'vitest'
import { compilerTsTypingsDeclaration } from '../../src/compiler/typings'

describe('compilerTsTypingsDeclaration', () => {
  it('generates empty code when graphs are empty', () => {
    const configRead: ApiPipeline.ConfigRead = {
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

    const result = compilerTsTypingsDeclaration(configRead)
    expect(result).toBe('')
  })

  it('includes comments when present and comment is true', () => {
    const configRead: ApiPipeline.ConfigRead = {
      config: {
        input: '',
      } as ApiPipeline.Config,
      inputs: {},
      outputs: [],
      graphs: {
        comments: ['@title Test API', '@version 1.0.0'],
        functions: [],
        imports: [],
        interfaces: [],
        typings: [],
        variables: [],
        response: {},
      },
    }

    const result = compilerTsTypingsDeclaration(configRead, true)
    expect(result).toContain('@title Test API')
    expect(result).toContain('@version 1.0.0')
  })

  it('excludes comments when comment is false', () => {
    const configRead: ApiPipeline.ConfigRead = {
      config: {
        input: '',
      } as ApiPipeline.Config,
      inputs: {},
      outputs: [],
      graphs: {
        comments: ['@title Test API'],
        functions: [],
        imports: [],
        interfaces: [],
        typings: [],
        variables: [],
        response: {},
      },
    }

    const result = compilerTsTypingsDeclaration(configRead, false)
    expect(result).not.toContain('@title Test API')
  })

  it('includes typings when present', () => {
    const configRead: ApiPipeline.ConfigRead = {
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
        typings: [
          {
            name: 'ApiResponse',
            value: 'Promise<T>',
            export: true,
          },
        ],
        variables: [],
        response: {},
      },
    }

    const result = compilerTsTypingsDeclaration(configRead)
    expect(result).toContain('ApiResponse')
    expect(result).toContain('Promise<T>')
  })

  it('includes interfaces when present', () => {
    const configRead: ApiPipeline.ConfigRead = {
      config: {
        input: '',
      } as ApiPipeline.Config,
      inputs: {},
      outputs: [],
      graphs: {
        comments: [],
        functions: [],
        imports: [],
        interfaces: [
          {
            name: 'User',
            properties: [
              { name: 'id', type: 'number', required: true },
              { name: 'name', type: 'string', required: false },
            ],
            export: true,
          },
        ],
        typings: [],
        variables: [],
        response: {},
      },
    }

    const result = compilerTsTypingsDeclaration(configRead)
    expect(result).toContain('interface User')
    expect(result).toContain('id')
    expect(result).toContain('name')
  })

  it('handles optional properties correctly', () => {
    const configRead: ApiPipeline.ConfigRead = {
      config: {
        input: '',
      } as ApiPipeline.Config,
      inputs: {},
      outputs: [],
      graphs: {
        comments: [],
        functions: [],
        imports: [],
        interfaces: [
          {
            name: 'User',
            properties: [
              { name: 'id', type: 'number', required: true },
              { name: 'email', type: 'string', required: false },
            ],
            export: true,
          },
        ],
        typings: [],
        variables: [],
        response: {},
      },
    }

    const result = compilerTsTypingsDeclaration(configRead)
    expect(result).toContain('id')
    expect(result).toContain('email')
  })

  it('handles properties without type (defaults to any)', () => {
    const configRead: ApiPipeline.ConfigRead = {
      config: {
        input: '',
      } as ApiPipeline.Config,
      inputs: {},
      outputs: [],
      graphs: {
        comments: [],
        functions: [],
        imports: [],
        interfaces: [
          {
            name: 'User',
            properties: [
              { name: 'data', type: undefined, required: true },
            ],
            export: true,
          },
        ],
        typings: [],
        variables: [],
        response: {},
      },
    }

    const result = compilerTsTypingsDeclaration(configRead)
    expect(result).toContain('data')
    expect(result).toContain('any')
  })

  it('includes property descriptions in JSDoc', () => {
    const configRead: ApiPipeline.ConfigRead = {
      config: {
        input: '',
      } as ApiPipeline.Config,
      inputs: {},
      outputs: [],
      graphs: {
        comments: [],
        functions: [],
        imports: [],
        interfaces: [
          {
            name: 'User',
            properties: [
              {
                name: 'id',
                type: 'number',
                required: true,
                description: 'User ID',
              },
            ],
            export: true,
          },
        ],
        typings: [],
        variables: [],
        response: {},
      },
    }

    const result = compilerTsTypingsDeclaration(configRead)
    expect(result).toContain('User ID')
  })

  it('handles non-exported interfaces', () => {
    const configRead: ApiPipeline.ConfigRead = {
      config: {
        input: '',
      } as ApiPipeline.Config,
      inputs: {},
      outputs: [],
      graphs: {
        comments: [],
        functions: [],
        imports: [],
        interfaces: [
          {
            name: 'InternalUser',
            properties: [],
            export: false,
          },
        ],
        typings: [],
        variables: [],
        response: {},
      },
    }

    const result = compilerTsTypingsDeclaration(configRead)
    expect(result).toContain('InternalUser')
  })

  it('handles non-exported typings', () => {
    const configRead: ApiPipeline.ConfigRead = {
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
        typings: [
          {
            name: 'InternalType',
            value: 'string',
            export: false,
          },
        ],
        variables: [],
        response: {},
      },
    }

    const result = compilerTsTypingsDeclaration(configRead)
    expect(result).toContain('InternalType')
  })

  it('handles empty properties array', () => {
    const configRead: ApiPipeline.ConfigRead = {
      config: {
        input: '',
      } as ApiPipeline.Config,
      inputs: {},
      outputs: [],
      graphs: {
        comments: [],
        functions: [],
        imports: [],
        interfaces: [
          {
            name: 'EmptyInterface',
            properties: [],
            export: true,
          },
        ],
        typings: [],
        variables: [],
        response: {},
      },
    }

    const result = compilerTsTypingsDeclaration(configRead)
    expect(result).toContain('EmptyInterface')
  })

  it('combines comments, typings, and interfaces', () => {
    const configRead: ApiPipeline.ConfigRead = {
      config: {
        input: '',
      } as ApiPipeline.Config,
      inputs: {},
      outputs: [],
      graphs: {
        comments: ['@title Test API'],
        functions: [],
        imports: [],
        interfaces: [
          {
            name: 'User',
            properties: [
              { name: 'id', type: 'number', required: true },
            ],
            export: true,
          },
        ],
        typings: [
          {
            name: 'ApiResponse',
            value: 'Promise<T>',
            export: true,
          },
        ],
        variables: [],
        response: {},
      },
    }

    const result = compilerTsTypingsDeclaration(configRead)
    expect(result).toContain('@title Test API')
    expect(result).toContain('User')
    expect(result).toContain('ApiResponse')
  })

  it('initializes empty arrays when undefined', () => {
    const configRead: ApiPipeline.ConfigRead = {
      config: {
        input: '',
      } as ApiPipeline.Config,
      inputs: {},
      outputs: [],
      graphs: {
        comments: undefined as any,
        functions: [],
        imports: [],
        interfaces: undefined as any,
        typings: undefined as any,
        variables: [],
        response: {},
      },
    }

    const result = compilerTsTypingsDeclaration(configRead)
    expect(result).toBe('')
    // Should not throw and should initialize arrays
    expect(configRead.graphs.comments).toEqual([])
    expect(configRead.graphs.interfaces).toEqual([])
    expect(configRead.graphs.typings).toEqual([])
  })

  it('handles interface with null properties', () => {
    const configRead: ApiPipeline.ConfigRead = {
      config: {
        input: '',
      } as ApiPipeline.Config,
      inputs: {},
      outputs: [],
      graphs: {
        comments: [],
        functions: [],
        imports: [],
        interfaces: [
          {
            name: 'Empty',
            properties: null as any,
            export: true,
          },
        ],
        typings: [],
        variables: [],
        response: {},
      },
    }

    const result = compilerTsTypingsDeclaration(configRead)
    expect(result).toContain('Empty')
  })

  it('handles interface with undefined properties', () => {
    const configRead: ApiPipeline.ConfigRead = {
      config: {
        input: '',
      } as ApiPipeline.Config,
      inputs: {},
      outputs: [],
      graphs: {
        comments: [],
        functions: [],
        imports: [],
        interfaces: [
          {
            name: 'Empty',
            properties: undefined as any,
            export: true,
          },
        ],
        typings: [],
        variables: [],
        response: {},
      },
    }

    const result = compilerTsTypingsDeclaration(configRead)
    expect(result).toContain('Empty')
  })
})
