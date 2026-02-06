import { parseOpenapiSpecification } from '@genapi/parser'
import { provide } from '@genapi/shared'
import { beforeEach, describe, expect, it } from 'vitest'
import { swagger2Minimal } from '../../../../parser/test/fixtures/swagger2-minimal'
import { parser } from '../../../src/got/ts/parser'

describe('got/ts parser', () => {
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
        comments: [],
        functions: [],
        imports: [],
        interfaces: [],
        typings: [],
        variables: [],
        response: {},
      },
      inputs: {},
      outputs: [],
    }
    provide({ configRead, interfaces: [], functions: [] })
  })

  it('parses simple GET endpoint', () => {
    const source = parseOpenapiSpecification(swagger2Minimal)
    configRead.source = source

    const result = parser(configRead)

    expect(result.graphs.functions).toHaveLength(1)
    const func = result.graphs.functions[0]
    expect(func.name).toBe('getPets')
    expect(func.export).toBe(true)
    expect(func.async).toBe(true)
    expect(func.body).toBeDefined()
    expect(func.body?.[0]).toContain('http.get')
  })

  it('includes prefixUrl when baseURL is configured', () => {
    const source = parseOpenapiSpecification(swagger2Minimal)
    configRead.source = source

    const result = parser(configRead)

    const func = result.graphs.functions[0]
    expect(func.body?.[0]).toContain('prefixUrl')
  })

  it('includes config parameter', () => {
    const source = parseOpenapiSpecification(swagger2Minimal)
    configRead.source = source

    const result = parser(configRead)

    const func = result.graphs.functions[0]
    const configParam = func.parameters?.find((p: any) => p.name === 'config')
    expect(configParam).toBeDefined()
    expect(configParam?.type).toBe('OptionsOfTextResponseBody')
    expect(configParam?.required).toBe(false)
  })
})
