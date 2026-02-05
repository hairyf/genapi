import { parseOpenapiSpecification } from '@genapi/parser'
import { provide } from '@genapi/shared'
import { beforeEach, describe, expect, it } from 'vitest'
// Use relative path to fixtures
import { swagger2Minimal } from '../../../../parser/test/fixtures/swagger2-minimal'
import { swagger2Parameters } from '../../../../parser/test/fixtures/swagger2-parameters'
import { parser } from '../../../src/ofetch/schema/index'

describe('ofetch/schema parser', () => {
  let configRead: any

  beforeEach(() => {
    configRead = {
      config: {
        input: 'test.json',
      },
      source: {},
      graphs: {
        comments: [],
        functions: [],
        imports: [],
        interfaces: [],
        typings: [],
        variables: [],
      },
      inputs: {},
      outputs: [],
    }
    provide({ configRead, interfaces: [], functions: [] })
  })

  it('collects route information for simple GET endpoint', () => {
    const source = parseOpenapiSpecification(swagger2Minimal)
    configRead.source = source

    const result = parser(configRead)

    expect((result as any).__schemaRoutes).toBeDefined()
    expect((result as any).__schemaRoutes).toHaveLength(1)

    const route = (result as any).__schemaRoutes[0]
    expect(route.path).toBe('/pets')
    expect(route.method).toBe('GET')
    expect(route.responseType).toBe('void')
  })

  it('parses query parameters correctly', () => {
    const source = parseOpenapiSpecification(swagger2Parameters)
    configRead.source = source

    const result = parser(configRead)

    const getRoute = (result as any).__schemaRoutes.find((r: any) => r.method === 'GET')
    expect(getRoute).toBeDefined()
    expect(getRoute.queryType).toContain('limit')
    expect(getRoute.queryType).toContain('tags')
    expect(getRoute.queryType).toContain('ids')
  })

  it('parses body parameters correctly', () => {
    const source = parseOpenapiSpecification(swagger2Parameters)
    configRead.source = source

    const result = parser(configRead)

    const getRoute = (result as any).__schemaRoutes.find((r: any) => r.method === 'GET')
    expect(getRoute).toBeDefined()
    expect(getRoute.bodyType).toBeDefined()
  })

  it('parses header parameters correctly', () => {
    const source = parseOpenapiSpecification(swagger2Parameters)
    configRead.source = source

    const result = parser(configRead)

    const getRoute = (result as any).__schemaRoutes.find((r: any) => r.method === 'GET')
    expect(getRoute).toBeDefined()
    expect(getRoute.headersType).toBeDefined()
    expect(getRoute.headersType).toContain('\'X-Request-ID\'')
  })

  it('handles dynamic path parameters', () => {
    const source = parseOpenapiSpecification(swagger2Parameters)
    configRead.source = source

    const result = parser(configRead)

    const routes = (result as any).__schemaRoutes
    const petRoute = routes.find((r: any) => r.path === '/pets/{petId}')
    expect(petRoute).toBeDefined()
    expect(petRoute.method).toBe('GET')
  })

  it('handles multiple methods on same path', () => {
    const source = parseOpenapiSpecification(swagger2Parameters)
    configRead.source = source

    const result = parser(configRead)

    const routes = (result as any).__schemaRoutes
    const petRoutes = routes.filter((r: any) => r.path === '/pets/{petId}')
    expect(petRoutes.length).toBeGreaterThanOrEqual(2)
    expect(petRoutes.some((r: any) => r.method === 'GET')).toBe(true)
    expect(petRoutes.some((r: any) => r.method === 'POST')).toBe(true)
  })
})
