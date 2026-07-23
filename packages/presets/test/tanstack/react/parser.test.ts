import { parseOpenapiSpecification } from '@genapi/parser'
import { provide } from '@genapi/shared'
import { beforeEach, describe, expect, it } from 'vitest'

import { swagger2Minimal } from '../../../../parser/test/fixtures/swagger2-minimal'
import { swagger2Parameters } from '../../../../parser/test/fixtures/swagger2-parameters'
import { swagger2SchemaDefinitions } from '../../../../parser/test/fixtures/swagger2-schema-definitions'
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

  it('parses GET endpoint into fetcher and useQuery hook', () => {
    const source = parseOpenapiSpecification(swagger2Minimal)
    configRead.source = source

    const result = parser(configRead)

    expect(result.graphs.scopes.api.functions).toHaveLength(1)
    expect(result.graphs.scopes.main.functions).toHaveLength(1)
    const fetcher = result.graphs.scopes.api.functions[0]
    const hook = result.graphs.scopes.main.functions[0]
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
    const fetcher = result.graphs.scopes.api.functions[0]
    const configParam = fetcher.parameters?.find((p: any) => p.name === 'config')
    expect(configParam).toBeDefined()
    expect(configParam?.type).toBe('RequestInit')
    expect(configParam?.required).toBe(false)
  })

  it('useQuery hook has same parameters as fetcher for GET', () => {
    const source = parseOpenapiSpecification(swagger2Minimal)
    configRead.source = source

    const result = parser(configRead)
    // const fetcher = result.graphs.scopes.api.functions[0]
    const hook = result.graphs.scopes.main.functions[0]
    // 新 hook 只有单个 options 参数，不再与 fetcher 保持一致
    expect(hook.parameters).toHaveLength(1)
    expect(hook.parameters![0].name).toBe('options')
    expect(hook.parameters![0].type).toContain('InitiaQueryOptions')
    expect(hook.body?.some(line => line.includes('queryKey') && line.includes('queryFn'))).toBe(true)
  })

  it('emits path/query/header parameter interfaces to type scope so Types.XXX resolves in main file', () => {
    const source = parseOpenapiSpecification(swagger2Parameters)
    configRead.source = source

    const result = parser(configRead)

    const typeInterfaces = result.graphs.scopes.type?.interfaces ?? []
    expect(typeInterfaces.length).toBeGreaterThanOrEqual(1)

    const pathInterface = typeInterfaces.find((i: any) => i.name.endsWith('Path'))
    const queryInterface = typeInterfaces.find((i: any) => i.name.endsWith('Query'))
    expect(pathInterface).toBeDefined()
    expect(pathInterface?.name).toMatch(/GetPets.*Path$/)
    expect(pathInterface?.properties).toContainEqual(expect.objectContaining({ name: 'petId', type: 'string' }))
    expect(queryInterface).toBeDefined()
    expect(queryInterface?.name).toMatch(/GetPets.*Query$/)

    expect(result.graphs.scopes.main.interfaces).toEqual([])
  })

  it('parses POST endpoint into fetcher and useMutation hook with InitiaMutationOptions', () => {
    const source = parseOpenapiSpecification(swagger2Parameters)
    configRead.source = source

    const result = parser(configRead)

    // POST /pets/{petId} → function name is postPetsPetId → hook name is usePostPetsPetId
    const mutationHook = result.graphs.scopes.main.functions.find((f: any) => f.name === 'usePostPetsPetId')!
    expect(mutationHook).toBeDefined()
    expect(mutationHook.export).toBe(true)
    expect(mutationHook.body?.some((line: string) => line.includes('useMutation'))).toBe(true)
    expect(mutationHook.body?.some((line: string) => line.includes('postPetsPetId'))).toBe(true)
    // mutation hook uses InitiaMutationOptions
    expect(mutationHook.parameters).toHaveLength(1)
    expect(mutationHook.parameters![0].name).toBe('options')
    expect(mutationHook.parameters![0].type).toContain('InitiaMutationOptions')
    // POST has required formData + path params → isRequired=true
    expect(mutationHook.parameters![0].required).toBe(true)
  })

  it('hook description uses @see apis.xxx instead of @wraps', () => {
    const source = parseOpenapiSpecification(swagger2Minimal)
    configRead.source = source

    const result = parser(configRead)
    const hook = result.graphs.scopes.main.functions[0]

    expect(hook.description).toBeDefined()
    expect(Array.isArray(hook.description) && hook.description.some((d: string) => d.includes('@see apis.'))).toBe(true)
    expect(Array.isArray(hook.description) && hook.description.some((d: string) => d.includes('@wraps'))).toBe(false)
  })

  it('adds all three type aliases (ExactQueryOptions, InitiaQueryOptions, InitiaMutationOptions) to type scope typings', () => {
    const source = parseOpenapiSpecification(swagger2Minimal)
    configRead.source = source

    const result = parser(configRead)
    const typeTypings = result.graphs.scopes.type?.typings ?? []

    const names = typeTypings.map((t: any) => t.name)
    expect(names).toContain('ExactQueryOptions')
    expect(names).toContain('InitiaQueryOptions')
    expect(names).toContain('InitiaMutationOptions')

    // All three should be exported
    typeTypings.forEach((t: any) => {
      expect(t.export).toBe(true)
    })
  })

  it('prefixes schema-defined response type (Pet) with Types. in hook type parameter', () => {
    const source = parseOpenapiSpecification(swagger2SchemaDefinitions)
    configRead.source = source

    const result = parser(configRead)
    const hook = result.graphs.scopes.main.functions[0]

    // getPetById has response $ref '#/definitions/Pet' → cleanResponseType should be 'Types.Pet'
    expect(hook.parameters![0].type).toContain('Types.Pet')
    // primitive-like types should not be prefixed
    expect(hook.parameters![0].type).not.toContain('Types.void')
    expect(hook.parameters![0].type).not.toContain('Types.any')
  })
})
