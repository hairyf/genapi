import type { ApiPipeline } from '@genapi/shared'
import { describe, expect, it } from 'vitest'
import { compile } from '../../src/compiler/scope'

describe('compile scope typings with generics', () => {
  const baseConfig = (overrides: Partial<ApiPipeline.ConfigRead['graphs']['scopes']['type']>): ApiPipeline.ConfigRead => ({
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
          interfaces: [],
          ...overrides,
        },
      },
      response: {},
    },
  })

  it('generates type alias without generics when generic is not provided', () => {
    const configRead = baseConfig({
      typings: [{ name: 'SimpleType', value: 'string', export: true }],
    })
    const result = compile(configRead, 'type')
    expect(result).toContain('export type SimpleType = string')
    expect(result).not.toContain('<')
  })

  it('generates type alias with simple generics (Response, Query)', () => {
    const configRead = baseConfig({
      typings: [{
        name: 'ExactQueryOptions',
        generic: 'Response, Query',
        value: 'Omit<Parameters<typeof useQuery<Response, Error, Response, readonly [string, Query]>>[0], "queryKey" | "queryFn">',
        export: true,
      }],
    })
    const result = compile(configRead, 'type')
    expect(result).toContain('ExactQueryOptions<Response, Query>')
    expect(result).toContain('readonly [string, Query]')
  })

  it('generates type alias with generics having default values', () => {
    const configRead = baseConfig({
      typings: [{
        name: 'InitiaQueryOptions',
        generic: 'RequestConfig = any, Response = void',
        value: 'Omit<ExactQueryOptions<Response, RequestConfig>, "queryKey" | "queryFn"> & { request: RequestConfig }',
        export: true,
      }],
    })
    const result = compile(configRead, 'type')
    expect(result).toContain('InitiaQueryOptions<RequestConfig = any, Response = void>')
  })

  it('generates type alias with generic default containing equals sign', () => {
    const configRead = baseConfig({
      typings: [{
        name: 'ComplexOption',
        generic: 'T = Record<string, unknown>',
        value: 'T',
        export: true,
      }],
    })
    const result = compile(configRead, 'type')
    expect(result).toContain('ComplexOption<T = Record<string, unknown>>')
  })

  it('handles empty generic string', () => {
    const configRead = baseConfig({
      typings: [{ name: 'EmptyGeneric', generic: '', value: 'string', export: true }],
    })
    const result = compile(configRead, 'type')
    expect(result).toContain('export type EmptyGeneric = string')
    expect(result).not.toContain('<')
  })

  it('handles non-exported typings with generics', () => {
    const configRead = baseConfig({
      typings: [{
        name: 'InternalType',
        generic: 'T',
        value: 'T',
        export: false,
      }],
    })
    const result = compile(configRead, 'type')
    expect(result).toContain('type InternalType<T>')
    expect(result).not.toContain('export type InternalType')
  })
})
