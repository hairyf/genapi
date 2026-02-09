import type { ApiPipeline, StatementField, StatementInterface } from '@genapi/shared'
import { provide } from '@genapi/shared'
import { beforeEach, describe, expect, it } from 'vitest'
import { transformParameters } from '../../src/transform/parameters'

describe('transformParameters', () => {
  let configRead: ApiPipeline.ConfigRead
  let interfaces: StatementInterface[]
  let parameters: StatementField[]

  beforeEach(() => {
    interfaces = [
      {
        name: 'User',
        properties: [
          { name: 'id', type: 'number', required: true },
          { name: 'name', type: 'string', required: false },
        ],
        export: true,
      },
    ]

    parameters = [
      { name: 'id', type: 'User', required: true },
      { name: 'query', type: 'QueryParams', required: false },
    ]

    configRead = {
      config: {
        input: '',
      } as ApiPipeline.Config,
      inputs: {},
      outputs: [
        {
          type: 'typings',
          root: './dist',
          path: './dist/types.d.ts',
          import: './types',
        },
      ],
      graphs: {
        comments: [],
        functions: [],
        imports: [],
        interfaces: [],
        typings: [],
        variables: [],
        response: {
          generic: '',
          infer: '',
        },
      },
    }

    provide({ configRead, interfaces })
  })

  it('transforms parameters for TypeScript syntax', () => {
    const description: string[] = []
    const result = transformParameters(parameters, {
      configRead,
      interfaces,
      description,
      responseType: 'User',
      syntax: 'typescript',
    })

    // When typings output exists, interface names get namespace prefix
    expect(result.spaceResponseType).toContain('User')
    expect(parameters[0].type).toContain('User')
    expect(parameters[0].required).toBe(true)
    expect(description).toHaveLength(0) // No JSDoc for TypeScript
  })

  it('transforms parameters for ECMAScript syntax with typings', () => {
    const description: string[] = []
    const result = transformParameters(parameters, {
      configRead,
      interfaces,
      description,
      responseType: 'User',
      syntax: 'ecmascript',
    })

    // When typings output exists, interface names get namespace prefix
    expect(result.spaceResponseType).toContain('Promise')
    expect(result.spaceResponseType).toContain('User')
    expect(parameters[0].type).toBeUndefined() // Removed for ECMAScript
    expect(parameters[0].required).toBe(true) // All become required
    expect(description.length).toBeGreaterThan(0) // JSDoc added
    expect(description.some(d => d.includes('@param'))).toBe(true)
    expect(description.some(d => d.includes('@return'))).toBe(true)
  })

  it('adds namespace prefix for existing interfaces in TypeScript', () => {
    configRead.outputs = [
      {
        type: 'typings',
        root: './dist',
        path: './dist/types.d.ts',
        import: './types',
      },
    ]

    const description: string[] = []
    transformParameters(parameters, {
      configRead,
      interfaces,
      description,
      responseType: 'User',
      syntax: 'typescript',
    })

    // User interface exists, so it should get namespace prefix
    expect(parameters[0].type).toBe('Types.User')
  })

  it('prefixes type names inside inline response type with Types when typings output exists', () => {
    configRead.outputs = [
      {
        type: 'typings',
        root: './dist',
        path: './dist/index.type.d.ts',
        import: './index.type',
      },
    ]

    const inlineResponseType = '{ success: boolean; message: string; data: ExchangeRateDto; timestamp: string }'
    const description: string[] = []
    const result = transformParameters(parameters, {
      configRead,
      interfaces,
      description,
      responseType: inlineResponseType,
      syntax: 'typescript',
    })

    // 内联响应类型中的 schema 类型名应带 Types. 前缀，便于生成代码中正确引用
    expect(result.spaceResponseType).toContain('Types.ExchangeRateDto')
    expect(result.spaceResponseType).not.toContain('data: ExchangeRateDto')
    expect(result.spaceResponseType).toContain('data: Types.ExchangeRateDto')
  })

  it('does not add namespace for non-existent interfaces', () => {
    const customParams: StatementField[] = [
      { name: 'id', type: 'NonExistentType', required: true },
    ]

    const description: string[] = []
    transformParameters(customParams, {
      configRead,
      interfaces,
      description,
      responseType: 'void',
      syntax: 'typescript',
    })

    expect(customParams[0].type).toBe('NonExistentType') // No namespace
  })

  it('handles array types with namespace', () => {
    const arrayParams: StatementField[] = [
      { name: 'users', type: 'User[]', required: true },
    ]

    const description: string[] = []
    transformParameters(arrayParams, {
      configRead,
      interfaces,
      description,
      responseType: 'void',
      syntax: 'typescript',
    })

    expect(arrayParams[0].type).toBe('Types.User[]')
  })

  it('handles union types', () => {
    const unionParams: StatementField[] = [
      { name: 'value', type: 'string | number', required: true },
    ]

    const description: string[] = []
    transformParameters(unionParams, {
      configRead,
      interfaces,
      description,
      responseType: 'void',
      syntax: 'typescript',
    })

    expect(unionParams[0].type).toBe('string | number')
  })

  it('handles union types with arrays', () => {
    const unionArrayParams: StatementField[] = [
      { name: 'items', type: 'string | number[]', required: true },
    ]

    const description: string[] = []
    transformParameters(unionArrayParams, {
      configRead,
      interfaces,
      description,
      responseType: 'void',
      syntax: 'typescript',
    })

    // The function handles union types with arrays differently
    expect(unionArrayParams[0].type).toBeTruthy()
    expect(unionArrayParams[0].type).toContain('[]')
  })

  it('handles union types with parentheses', () => {
    const parenParams: StatementField[] = [
      { name: 'value', type: '(string | number)', required: true },
    ]

    const description: string[] = []
    transformParameters(parenParams, {
      configRead,
      interfaces,
      description,
      responseType: 'void',
      syntax: 'typescript',
    })

    expect(parenParams[0].type).toBe('(string | number)')
  })

  it('skips parameters without type', () => {
    const paramsWithoutType: StatementField[] = [
      { name: 'id', type: 'User', required: true },
      { name: 'data', type: undefined, required: false },
    ]

    const description: string[] = []
    transformParameters(paramsWithoutType, {
      configRead,
      interfaces,
      description,
      responseType: 'void',
      syntax: 'typescript',
    })

    expect(paramsWithoutType[0].type).toBe('Types.User')
    expect(paramsWithoutType[1].type).toBeUndefined()
  })

  it('uses custom generic type when provided', () => {
    configRead.graphs.response = {
      generic: 'Promise<AxiosResponse<{__type__}>>',
      infer: '',
    }

    const description: string[] = []
    const result = transformParameters(parameters, {
      configRead,
      interfaces,
      description,
      responseType: 'User',
      syntax: 'typescript',
      generic: 'Promise<AxiosResponse<{__type__}>>',
    })

    // When typings output exists, interface names get namespace prefix
    expect(result.spaceResponseType).toContain('Promise<AxiosResponse')
    expect(result.spaceResponseType).toContain('User')
  })

  it('uses default generic for ECMAScript when not provided', () => {
    configRead.graphs.response = {
      generic: '',
      infer: '',
    }

    const description: string[] = []
    const result = transformParameters(parameters, {
      configRead,
      interfaces,
      description,
      responseType: 'User',
      syntax: 'ecmascript',
    })

    // When typings output exists, interface names get namespace prefix
    expect(result.spaceResponseType).toContain('Promise')
    expect(result.spaceResponseType).toContain('User')
  })

  it('uses default generic for TypeScript when not provided', () => {
    configRead.graphs.response = {
      generic: '',
      infer: '',
    }

    const description: string[] = []
    const result = transformParameters(parameters, {
      configRead,
      interfaces,
      description,
      responseType: 'User',
      syntax: 'typescript',
    })

    // When typings output exists, interface names get namespace prefix
    expect(result.spaceResponseType).toContain('User')
  })

  it('applies infer wrapper when infer is configured', () => {
    configRead.graphs.response = {
      generic: '{__type__}',
      infer: 'Infer',
    }

    const description: string[] = []
    const result = transformParameters(parameters, {
      configRead,
      interfaces,
      description,
      responseType: 'User',
      syntax: 'typescript',
    })

    // When typings output exists, interface names get namespace prefix
    expect(result.spaceResponseType).toContain('Infer')
    expect(result.spaceResponseType).toContain('User')
  })

  it('uses import path for namespace in ECMAScript', () => {
    configRead.outputs = [
      {
        type: 'typings',
        root: './dist',
        path: './dist/types.d.ts',
        import: './types',
      },
    ]

    const description: string[] = []
    transformParameters(parameters, {
      configRead,
      interfaces,
      description,
      responseType: 'User',
      syntax: 'ecmascript',
    })

    // In ECMAScript, namespace uses import() syntax
    expect(description.some(d => d.includes('import(\'./types\')'))).toBe(true)
  })

  it('adds optional marker for optional parameters in JSDoc', () => {
    const optionalParams: StatementField[] = [
      { name: 'id', type: 'string', required: false },
      { name: 'name', type: 'string', required: true },
    ]

    const description: string[] = []
    transformParameters(optionalParams, {
      configRead,
      interfaces: [],
      description,
      responseType: 'void',
      syntax: 'ecmascript',
    })

    const idParam = description.find(d => d.includes('id'))
    const nameParam = description.find(d => d.includes('name'))

    expect(idParam).toContain('=')
    expect(nameParam).not.toContain('=')
  })

  it('does not generate JSDoc when typings output is not configured', () => {
    configRead.outputs = []

    const description: string[] = []
    transformParameters(parameters, {
      configRead,
      interfaces,
      description,
      responseType: 'User',
      syntax: 'ecmascript',
    })

    expect(description).toHaveLength(0)
  })

  it('handles empty parameters array', () => {
    const description: string[] = []
    const result = transformParameters([], {
      configRead,
      interfaces,
      description,
      responseType: 'void',
      syntax: 'typescript',
    })

    expect(result.spaceResponseType).toBe('void')
    expect(description).toHaveLength(0)
  })

  it('handles complex nested array types', () => {
    const complexParams: StatementField[] = [
      { name: 'matrix', type: 'number[][]', required: true },
    ]

    const description: string[] = []
    transformParameters(complexParams, {
      configRead,
      interfaces: [],
      description,
      responseType: 'void',
      syntax: 'typescript',
    })

    expect(complexParams[0].type).toBe('number[][]')
  })

  it('handles undefined parameters array', () => {
    const description: string[] = []
    const result = transformParameters(undefined as any, {
      configRead,
      interfaces,
      description,
      responseType: 'void',
      syntax: 'typescript',
    })

    expect(result.spaceResponseType).toBe('void')
    expect(description).toHaveLength(0)
  })
})
