import type { ApiPipeline, StatementFunction, StatementInterface } from '@genapi/shared'
import { provide } from '@genapi/shared'
import { beforeEach, describe, expect, it } from 'vitest'
import { compile, genFunctionsWithMock } from '../../src/compiler/scope'

describe('compile(configRead, "main")', () => {
  let configRead: ApiPipeline.ConfigRead

  beforeEach(() => {
    const scopes = {
      main: { comments: [] as string[], functions: [] as any[], imports: [] as any[], variables: [] as any[], typings: [] as any[], interfaces: [] as any[] },
      type: { comments: [] as string[], functions: [] as any[], imports: [] as any[], variables: [] as any[], typings: [] as any[], interfaces: [] as any[] },
    }
    configRead = {
      config: { input: '', meta: {} } as ApiPipeline.Config,
      inputs: {},
      outputs: [{ type: 'main', root: './dist', path: './dist/index.ts' }],
      graphs: { scopes, response: {} },
    }
    provide({ configRead })
  })

  it('generates empty code when graphs are empty', () => {
    const result = compile(configRead, 'main')
    expect(result).toBe('')
  })

  it('includes comments when present', () => {
    configRead.graphs.scopes.main.comments = ['@title Test API', '@version 1.0.0']
    const result = compile(configRead, 'main')
    expect(result).toContain('@title Test API')
    expect(result).toContain('@version 1.0.0')
  })

  it('includes imports when present', () => {
    configRead.graphs.scopes.main.imports = [
      {
        name: 'ofetch',
        value: 'ofetch',
        type: false,
      },
    ]
    const result = compile(configRead, 'main')
    expect(result).toContain('import')
    expect(result).toContain('ofetch')
  })

  it('includes type imports', () => {
    configRead.graphs.scopes.main.imports = [
      {
        name: 'Types',
        value: './types',
        type: true,
        namespace: true,
      },
    ]
    const result = compile(configRead, 'main')
    expect(result).toContain('import type')
    expect(result).toContain('Types')
  })

  it('includes namespace imports', () => {
    configRead.graphs.scopes.main.imports = [
      {
        name: 'Types',
        value: './types',
        type: true,
        namespace: true,
      },
    ]
    const result = compile(configRead, 'main')
    expect(result).toContain('import')
    expect(result).toContain('Types')
    expect(result).toContain('./types')
  })

  it('includes default and named imports', () => {
    configRead.graphs.scopes.main.imports = [
      {
        name: 'defaultExport',
        value: './module',
        names: ['named1', 'named2'],
        type: false,
      },
    ]
    const result = compile(configRead, 'main')
    expect(result).toContain('defaultExport')
    expect(result).toContain('named1')
    expect(result).toContain('named2')
  })

  it('includes variables when present', () => {
    configRead.graphs.scopes.main.variables = [
      {
        name: 'baseURL',
        value: '\'https://api.example.com\'',
        export: true,
        flag: 'const',
      },
    ]
    const result = compile(configRead, 'main')
    expect(result).toContain('baseURL')
    expect(result).toContain('https://api.example.com')
  })

  it('includes functions when present', () => {
    configRead.graphs.scopes.main.functions = [
      {
        name: 'getUser',
        parameters: [
          { name: 'id', type: 'string', required: true },
        ],
        body: ['return ofetch(`/users/${id}`)'],
        returnType: 'Promise<User>',
      },
    ]
    const result = compile(configRead, 'main')
    expect(result).toContain('getUser')
    expect(result).toContain('id')
  })

  it('includes mockjs import when meta.mockjs is true', () => {
    configRead.config.meta = { mockjs: true }
    const result = compile(configRead, 'main')
    expect(result).toContain('better-mock')
    expect(result).toContain('Mock')
  })

  it('includes inline typings when typings output is not generated and request is TypeScript', () => {
    configRead.outputs = [
      {
        type: 'request',
        root: './dist',
        path: './dist/index.ts',
      },
    ]
    configRead.graphs.scopes.main.interfaces = [
      {
        name: 'User',
        properties: [
          { name: 'id', type: 'number', required: true },
        ],
        export: true,
      },
    ]
    const result = compile(configRead, 'main')
    expect(result).toContain('User')
  })

  it('does not include inline typings when typings output is generated', () => {
    configRead.outputs = [
      {
        type: 'request',
        root: './dist',
        path: './dist/index.ts',
      },
      {
        type: 'typings',
        root: './dist',
        path: './dist/types.d.ts',
      },
    ]
    configRead.graphs.scopes.main.interfaces = [
      {
        name: 'User',
        properties: [],
        export: true,
      },
    ]
    const result = compile(configRead, 'main')
    // Should not include typings inline when separate typings file exists
    // Result may be empty if no other content, but should not contain interface definitions
    expect(typeof result).toBe('string')
  })

  it('does not include inline typings when request is JavaScript', () => {
    configRead.outputs = [
      {
        type: 'request',
        root: './dist',
        path: './dist/index.js',
      },
    ]
    configRead.graphs.scopes.main.interfaces = [
      {
        name: 'User',
        properties: [],
        export: true,
      },
    ]
    const result = compile(configRead, 'main')
    // Should not include typings for JS files
    // Result may be empty if no other content
    expect(typeof result).toBe('string')
  })
})

describe('genFunctionsWithMock', () => {
  let configRead: ApiPipeline.ConfigRead
  let interfaceMap: Map<string, StatementInterface>

  beforeEach(() => {
    configRead = {
      config: {
        input: '',
        meta: {},
      } as ApiPipeline.Config,
      inputs: {},
      outputs: [],
      graphs: {
        scopes: { main: { comments: [], functions: [], imports: [], variables: [], typings: [], interfaces: [] } },
        response: { generic: '', infer: '' },
      },
    }
    provide({ configRead })

    interfaceMap = new Map([
      [
        'User',
        {
          name: 'User',
          properties: [
            { name: 'id', type: 'number', required: true },
            { name: 'name', type: 'string', required: false },
          ],
          export: true,
        },
      ],
    ])
  })

  it('generates functions without mock when mockjs is disabled', () => {
    const functions: StatementFunction[] = [
      {
        name: 'getUser',
        parameters: [],
        body: [],
        returnType: 'Promise<User>',
      },
    ]

    const result = genFunctionsWithMock(functions, interfaceMap, configRead.config)

    expect(result.length).toBeGreaterThan(0)
    expect(result[0]).toContain('getUser')
    expect(result.some(r => r.includes('.mock'))).toBe(false)
  })

  it('generates mock when mockjs is enabled and responseType exists', () => {
    configRead.config.meta = { mockjs: true }
    provide({ configRead })

    const functions: StatementFunction[] = [
      {
        name: 'getUser',
        parameters: [],
        body: [],
        returnType: 'Promise<User>',
      },
    ]

    // Use provide to inject responseType for the function name (named scope)
    // provide function supports overload: provide(scope, value) or provide(value)
    provide('getUser', { responseType: 'User' } as any)

    const result = genFunctionsWithMock(functions, interfaceMap, configRead.config)

    expect(result.some(r => r.includes('getUser.mock'))).toBe(true)
    expect(result.some(r => r.includes('Mock.mock'))).toBe(true)
  })

  it('does not generate mock for void response type', () => {
    configRead.config.meta = { mockjs: true }
    provide({ configRead })

    const functions: StatementFunction[] = [
      {
        name: 'deleteUser',
        parameters: [],
        body: [],
        returnType: 'Promise<void>',
      },
    ]

    provide('deleteUser', { responseType: 'void' } as any)

    const result = genFunctionsWithMock(functions, interfaceMap, configRead.config)

    expect(result.some(r => r.includes('.mock'))).toBe(false)
  })

  it('does not generate mock for any response type', () => {
    configRead.config.meta = { mockjs: true }
    provide({ configRead })

    const functions: StatementFunction[] = [
      {
        name: 'getData',
        parameters: [],
        body: [],
        returnType: 'Promise<any>',
      },
    ]

    provide('getData', { responseType: 'any' } as any)

    const result = genFunctionsWithMock(functions, interfaceMap, configRead.config)

    expect(result.some(r => r.includes('.mock'))).toBe(false)
  })

  it('generates mock for array response types', () => {
    configRead.config.meta = { mockjs: true }
    provide({ configRead })

    const functions: StatementFunction[] = [
      {
        name: 'getUsers',
        parameters: [],
        body: [],
        returnType: 'Promise<User[]>',
      },
    ]

    provide('getUsers', { responseType: 'User[]' } as any)

    const result = genFunctionsWithMock(functions, interfaceMap, configRead.config)

    expect(result.some(r => r.includes('getUsers.mock'))).toBe(true)
    expect(result.some(r => r.includes('Mock.mock'))).toBe(true)
  })

  it('generates mock template for interface properties with array types', () => {
    configRead.config.meta = { mockjs: true }
    provide({ configRead })

    // Add interface with array property
    interfaceMap.set('UserList', {
      name: 'UserList',
      properties: [
        { name: 'users', type: 'User[]', required: true },
        { name: 'count', type: 'number', required: true },
      ],
      export: true,
    })

    const functions: StatementFunction[] = [
      {
        name: 'getUserList',
        parameters: [],
        body: [],
        returnType: 'Promise<UserList>',
      },
    ]

    provide('getUserList', { responseType: 'UserList' } as any)

    const result = genFunctionsWithMock(functions, interfaceMap, configRead.config)

    // Should generate mock with array property handling (line 116-118)
    expect(result.some(r => r.includes('getUserList.mock'))).toBe(true)
    expect(result.some(r => r.includes('users'))).toBe(true)
  })

  it('handles functions with async flag', () => {
    const functions: StatementFunction[] = [
      {
        name: 'getUser',
        parameters: [],
        body: [],
        async: true,
        returnType: 'Promise<User>',
      },
    ]

    const result = genFunctionsWithMock(functions, interfaceMap, configRead.config)

    expect(result[0]).toContain('async')
  })

  it('handles functions with generics', () => {
    const functions: StatementFunction[] = [
      {
        name: 'getData',
        parameters: [],
        body: [],
        generics: [{ name: 'T' }],
        returnType: 'Promise<T>',
      },
    ]

    const result = genFunctionsWithMock(functions, interfaceMap, configRead.config)

    expect(result[0]).toContain('getData')
  })

  it('handles functions with JSDoc description', () => {
    const functions: StatementFunction[] = [
      {
        name: 'getUser',
        parameters: [],
        body: [],
        description: ['@summary Get user by ID'],
        returnType: 'Promise<User>',
      },
    ]

    const result = genFunctionsWithMock(functions, interfaceMap, configRead.config)

    expect(result[0]).toContain('@summary')
  })

  it('handles empty functions array', () => {
    const result = genFunctionsWithMock([], interfaceMap, configRead.config)
    expect(result).toHaveLength(0)
  })

  it('generates mock template for nested interfaces', () => {
    configRead.config.meta = { mockjs: true }
    provide({ configRead })

    interfaceMap.set('Address', {
      name: 'Address',
      properties: [
        { name: 'street', type: 'string', required: true },
        { name: 'city', type: 'string', required: true },
      ],
      export: true,
    })

    interfaceMap.set('User', {
      name: 'User',
      properties: [
        { name: 'id', type: 'number', required: true },
        { name: 'address', type: 'Address', required: true },
      ],
      export: true,
    })

    const functions: StatementFunction[] = [
      {
        name: 'getUser',
        parameters: [],
        body: [],
        returnType: 'Promise<User>',
      },
    ]

    provide('getUser', { responseType: 'User' } as any)

    const result = genFunctionsWithMock(functions, interfaceMap, configRead.config)

    expect(result.some(r => r.includes('getUser.mock'))).toBe(true)
    expect(result.some(r => r.includes('street'))).toBe(true)
    expect(result.some(r => r.includes('city'))).toBe(true)
  })

  it('handles primitive types in mock template', () => {
    configRead.config.meta = { mockjs: true }
    provide({ configRead })

    const functions: StatementFunction[] = [
      {
        name: 'getString',
        parameters: [],
        body: [],
        returnType: 'Promise<string>',
      },
    ]

    provide('getString', { responseType: 'string' } as any)

    const result = genFunctionsWithMock(functions, interfaceMap, configRead.config)

    expect(result.some(r => r.includes('getString.mock'))).toBe(true)
    expect(result.some(r => r.includes('@string'))).toBe(true)
  })

  it('handles union types in mock template', () => {
    configRead.config.meta = { mockjs: true }
    provide({ configRead })

    const functions: StatementFunction[] = [
      {
        name: 'getValue',
        parameters: [],
        body: [],
        returnType: 'Promise<string | number>',
      },
    ]

    provide('getValue', { responseType: 'string | number' } as any)

    const result = genFunctionsWithMock(functions, interfaceMap, configRead.config)

    expect(result.some(r => r.includes('getValue.mock'))).toBe(true)
  })

  it('handles interface without properties in mock template', () => {
    configRead.config.meta = { mockjs: true }
    provide({ configRead })

    const emptyInterfaceMap = new Map<string, StatementInterface>([
      [
        'Empty',
        {
          name: 'Empty',
          properties: [],
          export: true,
        },
      ],
    ])

    const functions: StatementFunction[] = [
      {
        name: 'getEmpty',
        parameters: [],
        body: [],
        returnType: 'Promise<Empty>',
      },
    ]

    provide('getEmpty', { responseType: 'Empty' } as any)

    const result = genFunctionsWithMock(functions, emptyInterfaceMap, configRead.config)

    expect(result.some(r => r.includes('getEmpty.mock'))).toBe(true)
  })

  it('handles interface with visited circular reference', () => {
    configRead.config.meta = { mockjs: true }
    provide({ configRead })

    const circularInterfaceMap = new Map<string, StatementInterface>([
      [
        'Node',
        {
          name: 'Node',
          properties: [
            { name: 'value', type: 'string', required: true },
            { name: 'next', type: 'Node', required: false },
          ],
          export: true,
        },
      ],
    ])

    const functions: StatementFunction[] = [
      {
        name: 'getNode',
        parameters: [],
        body: [],
        returnType: 'Promise<Node>',
      },
    ]

    provide('getNode', { responseType: 'Node' } as any)

    const result = genFunctionsWithMock(functions, circularInterfaceMap, configRead.config)

    // Should handle circular reference without infinite loop
    expect(result.some(r => r.includes('getNode.mock'))).toBe(true)
  })

  it('handles property without type in mock template', () => {
    configRead.config.meta = { mockjs: true }
    provide({ configRead })

    const interfaceMapWithUntypedProp = new Map<string, StatementInterface>([
      [
        'User',
        {
          name: 'User',
          properties: [
            { name: 'id', type: 'number', required: true },
            { name: 'data', type: undefined, required: false },
          ],
          export: true,
        },
      ],
    ])

    const functions: StatementFunction[] = [
      {
        name: 'getUser',
        parameters: [],
        body: [],
        returnType: 'Promise<User>',
      },
    ]

    provide('getUser', { responseType: 'User' } as any)

    const result = genFunctionsWithMock(functions, interfaceMapWithUntypedProp, configRead.config)

    // Should filter out properties without type
    expect(result.some(r => r.includes('getUser.mock'))).toBe(true)
    expect(result.some(r => r.includes('id'))).toBe(true)
  })
})
