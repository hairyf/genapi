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
        scopes: {
          main: { comments: [], functions: [], imports: [], variables: [], typings: [], interfaces: [] },
          type: { comments: [], functions: [], imports: [], variables: [], typings: [], interfaces: [] },
        },
        response: {},
      },
    }

    const result = compilerTsTypingsDeclaration(configRead)
    expect(result).toBe('')
  })

  it('includes comments when present and comment is true', () => {
    const configRead: ApiPipeline.ConfigRead = {
      config: { input: '' } as ApiPipeline.Config,
      inputs: {},
      outputs: [],
      graphs: {
        scopes: {
          main: { comments: [], functions: [], imports: [], variables: [], typings: [], interfaces: [] },
          type: { comments: ['@title Test API', '@version 1.0.0'], functions: [], imports: [], variables: [], typings: [], interfaces: [] },
        },
        response: {},
      },
    }

    const result = compilerTsTypingsDeclaration(configRead, true)
    expect(result).toContain('@title Test API')
    expect(result).toContain('@version 1.0.0')
  })

  it('includes type scope comments (comment param is ignored)', () => {
    const configRead: ApiPipeline.ConfigRead = {
      config: { input: '' } as ApiPipeline.Config,
      inputs: {},
      outputs: [],
      graphs: {
        scopes: {
          main: { comments: [], functions: [], imports: [], variables: [], typings: [], interfaces: [] },
          type: { comments: ['@title Test API'], functions: [], imports: [], variables: [], typings: [], interfaces: [] },
        },
        response: {},
      },
    }

    const result = compilerTsTypingsDeclaration(configRead, false)
    expect(result).toContain('@title Test API')
  })

  it('includes typings when present', () => {
    const configRead: ApiPipeline.ConfigRead = {
      config: { input: '' } as ApiPipeline.Config,
      inputs: {},
      outputs: [],
      graphs: {
        scopes: {
          main: { comments: [], functions: [], imports: [], variables: [], typings: [], interfaces: [] },
          type: {
            comments: [],
            functions: [],
            imports: [],
            variables: [],
            typings: [{ name: 'ApiResponse', value: 'Promise<T>', export: true }],
            interfaces: [],
          },
        },
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
        scopes: {
          main: { comments: [], functions: [], imports: [], variables: [], typings: [], interfaces: [] },
          type: {
            comments: [],
            functions: [],
            imports: [],
            variables: [],
            typings: [],
            interfaces: [
              { name: 'User', properties: [{ name: 'id', type: 'number', required: true }, { name: 'name', type: 'string', required: false }], export: true },
            ],
          },
        },
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
      config: { input: '' } as ApiPipeline.Config,
      inputs: {},
      outputs: [],
      graphs: {
        scopes: {
          main: { comments: [], functions: [], imports: [], variables: [], typings: [], interfaces: [] },
          type: {
            comments: [],
            functions: [],
            imports: [],
            variables: [],
            typings: [],
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
          },
        },
        response: {},
      },
    }

    const result = compilerTsTypingsDeclaration(configRead)
    expect(result).toContain('id')
    expect(result).toContain('email')
  })

  it('handles properties without type (defaults to any)', () => {
    const configRead: ApiPipeline.ConfigRead = {
      config: { input: '' } as ApiPipeline.Config,
      inputs: {},
      outputs: [],
      graphs: {
        scopes: {
          main: { comments: [], functions: [], imports: [], variables: [], typings: [], interfaces: [] },
          type: {
            comments: [],
            functions: [],
            imports: [],
            variables: [],
            typings: [],
            interfaces: [
              {
                name: 'User',
                properties: [{ name: 'data', type: undefined, required: true }],
                export: true,
              },
            ],
          },
        },
        response: {},
      },
    }

    const result = compilerTsTypingsDeclaration(configRead)
    expect(result).toContain('data')
    expect(result).toContain('any')
  })

  it('includes property descriptions in JSDoc', () => {
    const configRead: ApiPipeline.ConfigRead = {
      config: { input: '' } as ApiPipeline.Config,
      inputs: {},
      outputs: [],
      graphs: {
        scopes: {
          main: { comments: [], functions: [], imports: [], variables: [], typings: [], interfaces: [] },
          type: {
            comments: [],
            functions: [],
            imports: [],
            variables: [],
            typings: [],
            interfaces: [
              {
                name: 'User',
                properties: [{ name: 'id', type: 'number', required: true, description: 'User ID' }],
                export: true,
              },
            ],
          },
        },
        response: {},
      },
    }

    const result = compilerTsTypingsDeclaration(configRead)
    expect(result).toContain('User ID')
  })

  it('handles non-exported interfaces', () => {
    const configRead: ApiPipeline.ConfigRead = {
      config: { input: '' } as ApiPipeline.Config,
      inputs: {},
      outputs: [],
      graphs: {
        scopes: {
          main: { comments: [], functions: [], imports: [], variables: [], typings: [], interfaces: [] },
          type: {
            comments: [],
            functions: [],
            imports: [],
            variables: [],
            typings: [],
            interfaces: [{ name: 'InternalUser', properties: [], export: false }],
          },
        },
        response: {},
      },
    }

    const result = compilerTsTypingsDeclaration(configRead)
    expect(result).toContain('InternalUser')
  })

  it('handles non-exported typings', () => {
    const configRead: ApiPipeline.ConfigRead = {
      config: { input: '' } as ApiPipeline.Config,
      inputs: {},
      outputs: [],
      graphs: {
        scopes: {
          main: { comments: [], functions: [], imports: [], variables: [], typings: [], interfaces: [] },
          type: {
            comments: [],
            functions: [],
            imports: [],
            variables: [],
            typings: [{ name: 'InternalType', value: 'string', export: false }],
            interfaces: [],
          },
        },
        response: {},
      },
    }

    const result = compilerTsTypingsDeclaration(configRead)
    expect(result).toContain('InternalType')
  })

  it('handles empty properties array', () => {
    const configRead: ApiPipeline.ConfigRead = {
      config: { input: '' } as ApiPipeline.Config,
      inputs: {},
      outputs: [],
      graphs: {
        scopes: {
          main: { comments: [], functions: [], imports: [], variables: [], typings: [], interfaces: [] },
          type: {
            comments: [],
            functions: [],
            imports: [],
            variables: [],
            typings: [],
            interfaces: [{ name: 'EmptyInterface', properties: [], export: true }],
          },
        },
        response: {},
      },
    }

    const result = compilerTsTypingsDeclaration(configRead)
    expect(result).toContain('EmptyInterface')
  })

  it('combines comments, typings, and interfaces', () => {
    const configRead: ApiPipeline.ConfigRead = {
      config: { input: '' } as ApiPipeline.Config,
      inputs: {},
      outputs: [],
      graphs: {
        scopes: {
          main: { comments: [], functions: [], imports: [], variables: [], typings: [], interfaces: [] },
          type: {
            comments: ['@title Test API'],
            functions: [],
            imports: [],
            variables: [],
            typings: [{ name: 'ApiResponse', value: 'Promise<T>', export: true }],
            interfaces: [
              { name: 'User', properties: [{ name: 'id', type: 'number', required: true }], export: true },
            ],
          },
        },
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
      config: { input: '' } as ApiPipeline.Config,
      inputs: {},
      outputs: [],
      graphs: {
        scopes: {
          main: { comments: [], functions: [], imports: [], variables: [], typings: [], interfaces: [] },
          type: {
            comments: undefined as any,
            functions: [],
            imports: [],
            variables: [],
            typings: undefined as any,
            interfaces: undefined as any,
          },
        },
        response: {},
      },
    }

    const result = compilerTsTypingsDeclaration(configRead)
    expect(result).toBe('')
    expect(configRead.graphs.scopes.type.comments || []).toEqual([])
    expect(configRead.graphs.scopes.type.interfaces || []).toEqual([])
    expect(configRead.graphs.scopes.type.typings || []).toEqual([])
  })

  it('handles interface with null properties', () => {
    const configRead: ApiPipeline.ConfigRead = {
      config: { input: '' } as ApiPipeline.Config,
      inputs: {},
      outputs: [],
      graphs: {
        scopes: {
          main: { comments: [], functions: [], imports: [], variables: [], typings: [], interfaces: [] },
          type: {
            comments: [],
            functions: [],
            imports: [],
            variables: [],
            typings: [],
            interfaces: [{ name: 'Empty', properties: null as any, export: true }],
          },
        },
        response: {},
      },
    }

    const result = compilerTsTypingsDeclaration(configRead)
    expect(result).toContain('Empty')
  })

  it('handles interface with undefined properties', () => {
    const configRead: ApiPipeline.ConfigRead = {
      config: { input: '' } as ApiPipeline.Config,
      inputs: {},
      outputs: [],
      graphs: {
        scopes: {
          main: { comments: [], functions: [], imports: [], variables: [], typings: [], interfaces: [] },
          type: {
            comments: [],
            functions: [],
            imports: [],
            variables: [],
            typings: [],
            interfaces: [{ name: 'Empty', properties: undefined as any, export: true }],
          },
        },
        response: {},
      },
    }

    const result = compilerTsTypingsDeclaration(configRead)
    expect(result).toContain('Empty')
  })

  it('generates correct property keys for header names with hyphens (varFiled format)', () => {
    const configRead: ApiPipeline.ConfigRead = {
      config: { input: '' } as ApiPipeline.Config,
      inputs: {},
      outputs: [],
      graphs: {
        scopes: {
          main: { comments: [], functions: [], imports: [], variables: [], typings: [], interfaces: [] },
          type: {
            comments: [],
            functions: [],
            imports: [],
            variables: [],
            typings: [],
            interfaces: [
              {
                name: 'PostKycWebhookHeader',
                properties: [
                  { name: '\'x-payload-digest-alg\'', type: 'string', required: true },
                  { name: '\'x-payload-digest\'', type: 'string', required: true },
                ],
                export: true,
              },
            ],
          },
        },
        response: {},
      },
    }

    const result = compilerTsTypingsDeclaration(configRead)
    expect(result).toContain('PostKycWebhookHeader')
    expect(result).toMatch(/"x-payload-digest-alg":\s*string/)
    expect(result).toMatch(/"x-payload-digest":\s*string/)
    expect(result).not.toMatch(/"'x-payload-digest-alg'":/)
    expect(result).not.toMatch(/"'x-payload-digest'":/)
  })
})
