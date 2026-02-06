import { parseOpenapiSpecification } from '@genapi/parser'
import { provide } from '@genapi/shared'
import { beforeEach, describe, expect, it } from 'vitest'

import { swagger2Minimal } from '../../../../parser/test/fixtures/swagger2-minimal'
import { parser } from '../../../src/tanstack/react/parser'

describe('tanstack/react parser', () => {
  let configRead: any

  beforeEach(() => {
    configRead = {
      config: {
        input: 'test.json',
        meta: { baseURL: 'https://api.example.com' },
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

  it('parses GET endpoint into fetcher and useQuery hook', () => {
    const source = parseOpenapiSpecification(swagger2Minimal)
    configRead.source = source

    const result = parser(configRead)

    expect(result.graphs.functions).toHaveLength(2)
    const [fetcher, hook] = result.graphs.functions
    expect(fetcher.name).toBe('getPets')
    expect(fetcher.export).toBe(true)
    expect(fetcher.async).toBe(true)
    expect(fetcher.body).toBeDefined()
    expect(hook.name).toBe('useGetPets')
    expect(hook.export).toBe(true)
    expect(hook.body?.some(line => line.includes('useQuery'))).toBe(true)
    expect(hook.body?.some(line => line.includes('getPets'))).toBe(true)
  })

  it('fetcher includes config parameter with RequestInit type', () => {
    const source = parseOpenapiSpecification(swagger2Minimal)
    configRead.source = source

    const result = parser(configRead)
    const fetcher = result.graphs.functions[0]
    const configParam = fetcher.parameters?.find((p: any) => p.name === 'config')
    expect(configParam).toBeDefined()
    expect(configParam?.type).toBe('RequestInit')
    expect(configParam?.required).toBe(false)
  })

  it('useQuery hook has same parameters as fetcher for GET', () => {
    const source = parseOpenapiSpecification(swagger2Minimal)
    configRead.source = source

    const result = parser(configRead)
    const [fetcher, hook] = result.graphs.functions
    expect(fetcher.parameters?.length).toBe(hook.parameters?.length)
    expect(hook.body?.some(line => line.includes('queryKey') && line.includes('queryFn'))).toBe(true)
  })
})
