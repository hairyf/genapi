import { parseOpenapiSpecification } from '@genapi/parser'
import { provide } from '@genapi/shared'
import { beforeEach, describe, expect, it } from 'vitest'
import { swagger2Minimal } from '../../../../parser/test/fixtures/swagger2-minimal'
import { parser } from '../../../src/ofetch/ts/parser'

describe('ofetch/ts parser', () => {
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
    expect(func.body?.[0]).toContain('ofetch')
  })

  it('includes baseURL when configured', () => {
    const source = parseOpenapiSpecification(swagger2Minimal)
    configRead.source = source

    const result = parser(configRead)

    const func = result.graphs.scopes.main.functions[0]
    expect(func.body?.[0]).toContain('baseURL')
  })

  it('includes options parameter', () => {
    const source = parseOpenapiSpecification(swagger2Minimal)
    configRead.source = source

    const result = parser(configRead)

    const func = result.graphs.scopes.main.functions[0]
    const optionsParam = func.parameters?.find((p: any) => p.name === 'options')
    expect(optionsParam).toBeDefined()
    expect(optionsParam?.type).toBe('FetchOptions')
    expect(optionsParam?.required).toBe(false)
  })
})
