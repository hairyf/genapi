import { parseOpenapiSpecification } from '@genapi/parser'
import { provide } from '@genapi/shared'
import { beforeEach, describe, expect, it } from 'vitest'
import { swagger2Minimal } from '../../../../parser/test/fixtures/swagger2-minimal'
import { swagger2Parameters } from '../../../../parser/test/fixtures/swagger2-parameters'
import { parser } from '../../../src/fetch/ts/parser'

describe('fetch/ts parser', () => {
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
    expect(func.async).toBe(true)
    expect(func.body).toBeDefined()
  })

  it('includes config parameter', () => {
    const source = parseOpenapiSpecification(swagger2Minimal)
    configRead.source = source

    const result = parser(configRead)

    const func = result.graphs.scopes.main.functions[0]
    const configParam = func.parameters?.find((p: any) => p.name === 'config')
    expect(configParam).toBeDefined()
    expect(configParam?.type).toBe('RequestInit')
    expect(configParam?.required).toBe(false)
  })

  it('emits path/query parameter interfaces to type scope so Types.XXX resolves in main file', () => {
    const source = parseOpenapiSpecification(swagger2Parameters)
    configRead.source = source

    const result = parser(configRead)

    const typeInterfaces = result.graphs.scopes.type?.interfaces ?? []
    const pathInterface = typeInterfaces.find((i: any) => i.name.endsWith('Path'))
    const queryInterface = typeInterfaces.find((i: any) => i.name.endsWith('Query'))
    expect(pathInterface).toBeDefined()
    expect(pathInterface?.properties).toContainEqual(expect.objectContaining({ name: 'petId', type: 'string' }))
    expect(queryInterface).toBeDefined()
    expect(result.graphs.scopes.main.interfaces).toEqual([])
  })
})
