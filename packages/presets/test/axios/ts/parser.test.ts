import { parseOpenapiSpecification } from '@genapi/parser'
import { provide } from '@genapi/shared'
import { beforeEach, describe, expect, it } from 'vitest'
import { swagger2Minimal } from '../../../../parser/test/fixtures/swagger2-minimal'
import { swagger2Parameters } from '../../../../parser/test/fixtures/swagger2-parameters'
import { parser } from '../../../src/axios/ts/parser'

describe('axios/ts parser', () => {
  let configRead: any

  beforeEach(() => {
    configRead = {
      config: {
        input: 'test.json',
        meta: {
          baseURL: 'https://api.example.com',
        },
      },
      source: {},
      graphs: {
        scopes: {
          main: { comments: [], functions: [], imports: [], interfaces: [], typings: [], variables: [] },
          type: { comments: [], functions: [], imports: [], variables: [], typings: [], interfaces: [] },
        },
        response: {},
      },
      inputs: {},
      outputs: [],
    }
    provide({ configRead, interfaces: { add: () => {}, values: () => [], all: () => [] }, functions: { add: () => {}, values: () => [], all: () => [] } })
  })

  it('parses simple GET endpoint', () => {
    const source = parseOpenapiSpecification(swagger2Minimal)
    configRead.source = source

    const result = parser(configRead)

    expect(result.graphs.scopes.main.functions).toHaveLength(1)
    const func = result.graphs.scopes.main.functions[0]
    expect(func.name).toBe('getPets')
    expect(func.export).toBe(true)
    expect(func.body).toBeDefined()
    expect(func.body?.[0]).toContain('const url =')
    expect(func.body?.[1]).toContain('return http.request')
  })

  it('includes baseURL option when configured', () => {
    const source = parseOpenapiSpecification(swagger2Minimal)
    configRead.source = source

    const result = parser(configRead)

    const func = result.graphs.scopes.main.functions[0]
    expect(func.body?.[1]).toContain('baseURL')
  })

  it('does not include baseURL when explicitly disabled', () => {
    // Create a fresh configRead with baseURL explicitly set to false
    // transformBaseURL will auto-set baseURL from spec if schemes/host exist,
    // so we need to explicitly disable it
    const configReadWithoutBaseURL: any = {
      config: {
        input: 'test.json',
        meta: {
          baseURL: false, // Explicitly disable baseURL
        },
      },
      source: {},
      graphs: {
        scopes: {
          main: { comments: [], functions: [], imports: [], interfaces: [], typings: [], variables: [] },
          type: { comments: [], functions: [], imports: [], variables: [], typings: [], interfaces: [] },
        },
        response: {},
      },
      inputs: {},
      outputs: [],
    }
    provide({ configRead: configReadWithoutBaseURL, interfaces: { add: () => {}, values: () => [], all: () => [] }, functions: { add: () => {}, values: () => [], all: () => [] } })

    const source = parseOpenapiSpecification(swagger2Minimal)
    configReadWithoutBaseURL.source = source

    const result = parser(configReadWithoutBaseURL)

    const func = result.graphs.scopes.main.functions[0]
    // baseURL should not be in options when explicitly disabled
    expect(func.body?.[1]).not.toContain('baseURL')
  })

  it('parses query parameters correctly', () => {
    const source = parseOpenapiSpecification(swagger2Parameters)
    configRead.source = source

    const result = parser(configRead)

    const getFunc = result.graphs.scopes.main.functions.find((f: any) => f.name.toLowerCase().includes('get'))
    expect(getFunc).toBeDefined()
    expect(getFunc?.parameters).toBeDefined()
    const paramsParam = getFunc?.parameters?.find((p: any) => p.name === 'params')
    expect(paramsParam).toBeDefined()
  })

  it('includes config parameter', () => {
    const source = parseOpenapiSpecification(swagger2Minimal)
    configRead.source = source

    const result = parser(configRead)

    const func = result.graphs.scopes.main.functions[0]
    const configParam = func.parameters?.find((p: any) => p.name === 'config')
    expect(configParam).toBeDefined()
    expect(configParam?.type).toBe('AxiosRequestConfig')
    expect(configParam?.required).toBe(false)
  })

  it('includes method in options', () => {
    const source = parseOpenapiSpecification(swagger2Minimal)
    configRead.source = source

    const result = parser(configRead)

    const func = result.graphs.scopes.main.functions[0]
    expect(func.body?.[1]).toContain('method')
    expect(func.body?.[1]).toContain('"get"')
  })
})
