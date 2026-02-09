import type { SchemaRoute } from '../../../src/ofetch/schema/parser'
import { beforeEach, describe, expect, it } from 'vitest'
import { compiler } from '../../../src/ofetch/schema/compiler'

describe('ofetch/schema compiler', () => {
  let configRead: any

  beforeEach(() => {
    const mainSlice = {
      comments: [] as string[],
      functions: [] as any[],
      imports: [
        { name: 'fetch', value: 'ofetch' },
        {
          names: ['TypedFetchInput', 'TypedFetchRequestInit', 'TypedFetchResponseBody', 'TypedResponse', 'Endpoint', 'DynamicParam'],
          value: 'fetchdts',
        },
      ],
      interfaces: [] as any[],
      typings: [] as any[],
      variables: [] as any[],
    }
    configRead = {
      config: { input: 'test.json' },
      graphs: {
        scopes: {
          main: { ...mainSlice },
          type: { comments: [], functions: [], imports: [], interfaces: [], typings: [], variables: [] },
        },
        response: {},
      },
      outputs: [
        { type: 'main', path: 'dist/index.ts' },
        { type: 'type', path: 'dist/index.type.ts' },
      ],
    }
  })

  it('generates $fetch function', () => {
    ;(configRead as any).__schemaRoutes = [
      {
        path: '/users',
        method: 'GET',
        responseType: 'User[]',
      },
    ] as SchemaRoute[]

    const result = compiler(configRead)

    expect(result.graphs.scopes.main.functions).toHaveLength(1)
    const fetchFunction = result.graphs.scopes.main.functions[0]
    expect(fetchFunction.name).toBe('$fetch')
    expect(fetchFunction.export).toBe(true)
    expect(fetchFunction.async).toBe(true)
    expect(fetchFunction.generics).toBeDefined()
    expect(fetchFunction.generics?.[0]?.name).toBe('T')
    expect(fetchFunction.generics?.[0]?.extends).toBe('TypedFetchInput<APISchema>')
    expect(fetchFunction.parameters).toHaveLength(2)
    expect(fetchFunction.parameters?.[0]?.name).toBe('input')
    expect(fetchFunction.parameters?.[1]?.name).toBe('init')
  })

  it('generates APISchema interface for simple path', () => {
    ;(configRead as any).__schemaRoutes = [
      {
        path: '/users',
        method: 'GET',
        responseType: 'User[]',
      },
    ] as SchemaRoute[]

    compiler(configRead)

    const output = configRead.outputs[0]
    expect(output.code).toBeDefined()
    expect(output.code).toContain('interface APISchema')
    expect(output.code).toContain('"/users"')
    expect(output.code).toContain('[Endpoint]')
    expect(output.code).toContain('GET')
    expect(output.code).toContain('response: User[]')
  })

  it('generates schema for dynamic path parameters', () => {
    ;(configRead as any).__schemaRoutes = [
      {
        path: '/users/{id}',
        method: 'GET',
        responseType: 'User',
      },
    ] as SchemaRoute[]

    compiler(configRead)

    const output = configRead.outputs[0]
    expect(output.code).toBeDefined()
    expect(output.code).toContain('[DynamicParam]')
  })

  it('generates schema with query parameters', () => {
    ;(configRead as any).__schemaRoutes = [
      {
        path: '/users',
        method: 'GET',
        queryType: '{ limit?: number; offset?: number }',
        responseType: 'User[]',
      },
    ] as SchemaRoute[]

    compiler(configRead)

    const output = configRead.outputs[0]
    expect(output.code).toBeDefined()
    expect(output.code).toContain('query:')
    expect(output.code).toContain('limit')
    expect(output.code).toContain('offset')
  })

  it('generates schema with body parameters', () => {
    ;(configRead as any).__schemaRoutes = [
      {
        path: '/users',
        method: 'POST',
        bodyType: '{ name: string; email: string }',
        responseType: 'User',
      },
    ] as SchemaRoute[]

    compiler(configRead)

    const output = configRead.outputs[0]
    expect(output.code).toBeDefined()
    expect(output.code).toContain('body:')
    expect(output.code).toContain('name: string')
    expect(output.code).toContain('email: string')
  })

  it('generates schema with headers', () => {
    ;(configRead as any).__schemaRoutes = [
      {
        path: '/users',
        method: 'GET',
        headersType: '{ \'Authorization\': string }',
        responseType: 'User[]',
      },
    ] as SchemaRoute[]

    compiler(configRead)

    const output = configRead.outputs[0]
    expect(output.code).toBeDefined()
    expect(output.code).toContain('headers:')
    expect(output.code).toContain('Authorization')
  })

  it('handles multiple routes correctly', () => {
    ;(configRead as any).__schemaRoutes = [
      {
        path: '/users',
        method: 'GET',
        responseType: 'User[]',
      },
      {
        path: '/users/{id}',
        method: 'GET',
        responseType: 'User',
      },
      {
        path: '/posts',
        method: 'GET',
        responseType: 'Post[]',
      },
    ] as SchemaRoute[]

    compiler(configRead)

    const output = configRead.outputs[0]
    expect(output.code).toBeDefined()
    expect(output.code).toContain('"/users"')
    expect(output.code).toContain('"/posts"')
    expect(output.code).toContain('[DynamicParam]')
  })

  it('handles empty routes', () => {
    ;(configRead as any).__schemaRoutes = []

    compiler(configRead)

    expect(configRead.graphs.scopes.main.functions).toHaveLength(1)
    const fetchFunction = configRead.graphs.scopes.main.functions[0]
    expect(fetchFunction.name).toBe('$fetch')
  })

  it('replaces ofetch import with fetch', () => {
    ;(configRead as any).__schemaRoutes = [
      {
        path: '/users',
        method: 'GET',
        responseType: 'User[]',
      },
    ] as SchemaRoute[]

    compiler(configRead)

    const output = configRead.outputs[0]
    expect(output.code).toBeDefined()
    expect(output.code).toContain('import fetch from "ofetch"')
    expect(output.code).not.toContain('import { default as ofetch')
  })

  it('generates correct function signature', () => {
    ;(configRead as any).__schemaRoutes = [
      {
        path: '/users',
        method: 'GET',
        responseType: 'User[]',
      },
    ] as SchemaRoute[]

    compiler(configRead)

    const output = configRead.outputs[0]
    expect(output.code).toBeDefined()
    expect(output.code).toContain('async function $fetch')
    expect(output.code).toContain('<T extends TypedFetchInput<APISchema>>')
    expect(output.code).toContain('input: T')
    expect(output.code).toContain('init?: TypedFetchRequestInit<APISchema, T>')
    expect(output.code).toContain('Promise<TypedResponse<TypedFetchResponseBody<APISchema, T>>>')
  })
})
