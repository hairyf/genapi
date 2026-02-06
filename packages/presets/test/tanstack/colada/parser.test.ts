import { parseOpenapiSpecification } from '@genapi/parser'
import { provide } from '@genapi/shared'
import { beforeEach, describe, expect, it } from 'vitest'

import { swagger2Minimal } from '../../../../parser/test/fixtures/swagger2-minimal'
import { parser } from '../../../src/tanstack/colada/parser'

describe('tanstack/colada parser', () => {
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

  it('parses GET endpoint into fetcher and useQuery hook with key and query', () => {
    const source = parseOpenapiSpecification(swagger2Minimal)
    configRead.source = source

    const result = parser(configRead)

    expect(result.graphs.functions).toHaveLength(2)
    const [fetcher, hook] = result.graphs.functions
    expect(fetcher.name).toBe('getPets')
    expect(hook.name).toBe('useGetPets')
    expect(hook.body?.some(line => line.includes('useQuery'))).toBe(true)
    expect(hook.body?.some(line => line.includes('key:') && line.includes('query:'))).toBe(true)
    expect(hook.body?.some(line => line.includes('getPets'))).toBe(true)
  })

  it('useMutation uses mutation option (not mutationFn)', () => {
    const source = parseOpenapiSpecification({
      ...swagger2Minimal,
      paths: {
        '/pets': {
          ...swagger2Minimal.paths!['/pets'],
          post: {
            summary: 'Create pet',
            responses: { 200: { description: 'Created' } },
          },
        },
      },
    })
    configRead.source = source

    const result = parser(configRead)
    const mutationHook = result.graphs.functions.find((f: any) =>
      f.body?.some((line: string) => line.includes('useMutation') && line.includes('mutation:')),
    )
    expect(mutationHook).toBeDefined()
    expect(mutationHook!.body?.some((line: string) => line.includes('mutation:') && !line.includes('mutationFn'))).toBe(true)
  })
})
