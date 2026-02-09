import type { ApiPipeline } from '@genapi/shared'
import { provide } from '@genapi/shared'
import { beforeEach, describe, expect, it } from 'vitest'
import {
  transformBaseURL,
  transformFetchBody,
  transformQueryParams,
  transformUrlSyntax,
} from '../../src/transform/urls'

describe('transformQueryParams', () => {
  it('replaces option with URLSearchParams snippet when optionKey provided', () => {
    const options: any[] = ['query']
    transformQueryParams('query', { options, optionKey: 'searchParams' })
    expect(options).toContainEqual(['searchParams', expect.stringContaining('URLSearchParams')])
    expect(options).not.toContain('query')
  })

  it('removes option and appends body line when no optionKey', () => {
    const body: string[] = []
    const options: any[] = ['query']
    transformQueryParams('query', { body, options })
    expect(body).toHaveLength(1)
    expect(body[0]).toContain('URLSearchParams')
    expect(body[0]).toContain('querystr')
    expect(options).not.toContain('query')
  })

  it('returns url fragment with ?${name}str when no optionKey', () => {
    const options: any[] = ['query']
    const url = transformQueryParams('query', { body: [], options })
    expect(url).toContain('?')
    expect(url).toContain('str')
  })
})

describe('transformUrlSyntax', () => {
  it('wraps URL without $ in single quotes', () => {
    expect(transformUrlSyntax('/pets')).toBe('\'/pets\'')
  })

  it('wraps URL with $ in template literal', () => {
    expect(transformUrlSyntax('/pets/${paths.id}')).toContain('`')
    expect(transformUrlSyntax('/pets/${paths.id}')).toContain('${paths.id}')
  })

  it('prefixes baseURL when option provided', () => {
    expect(transformUrlSyntax('/v1/pets', { baseURL: 'https://api.example.com' })).toContain('baseURL')
    expect(transformUrlSyntax('/v1/pets', { baseURL: 'https://api.example.com' })).toContain('/v1/pets')
  })
})

describe('transformFetchBody', () => {
  it('returns json body for object-like response type', () => {
    const body = transformFetchBody('url', [], 'Pet')
    expect(body).toHaveLength(2)
    expect(body[0]).toContain('fetch')
    expect(body[1]).toContain('response.json')
  })

  it('returns void body for void response type', () => {
    const body = transformFetchBody('url', [], 'void')
    expect(body).toHaveLength(1)
    expect(body[0]).toContain('await fetch')
    expect(body[0]).not.toContain('return')
  })

  it('returns text body for string response type', () => {
    const body = transformFetchBody('url', [], 'string')
    expect(body[1]).toContain('response.text')
  })

  it('returns none for any response type', () => {
    const body = transformFetchBody('url', [], 'any')
    expect(body[1]).toBe('return response')
  })
})

describe('transformBaseURL', () => {
  let configRead: ApiPipeline.ConfigRead

  beforeEach(() => {
    const scopes: ApiPipeline.Graphs['scopes'] = {
      main: { comments: [], functions: [], imports: [], variables: [], typings: [], interfaces: [] },
      type: { comments: [], functions: [], imports: [], variables: [], typings: [], interfaces: [] },
    }
    configRead = {
      config: {
        input: '',
        meta: {},
      } as ApiPipeline.Config,
      inputs: {},
      outputs: [],
      graphs: {
        scopes,
        response: {},
      },
    }
    provide({
      configRead,
      variables: {
        add: (scope: string, item: any) => {
          if (!scopes[scope])
            scopes[scope] = { comments: [], functions: [], imports: [], variables: [], typings: [], interfaces: [] }
          scopes[scope].variables.push(item)
        },
        values: (scope: string) => scopes[scope].variables,
        all: () => Object.values(scopes).flatMap(s => s.variables),
      },
    })
  })

  it('does not set baseURL when baseURL is false', () => {
    configRead.config.meta = { baseURL: false }
    provide({ configRead })

    const source = {
      swagger: '2.0',
      schemes: ['https'],
      host: 'api.example.com',
      paths: {},
    }

    transformBaseURL(source as any)

    expect(configRead.config.meta.baseURL).toBe(false)
  })

  it('sets baseURL from schemes and host when not provided', () => {
    const source = {
      swagger: '2.0',
      schemes: ['https'],
      host: 'api.example.com',
      basePath: '/v1',
      paths: {},
    }

    transformBaseURL(source as any)

    expect(configRead.config.meta?.baseURL).toContain('https://api.example.com')
    expect(configRead.config.meta?.baseURL).toContain('/v1')
  })

  it('uses http when https is not in schemes', () => {
    const source = {
      swagger: '2.0',
      schemes: ['http'],
      host: 'api.example.com',
      basePath: '/v1',
      paths: {},
    }

    transformBaseURL(source as any)

    expect(configRead.config.meta?.baseURL).toContain('http://api.example.com')
    expect(configRead.config.meta?.baseURL).toContain('/v1')
  })

  it('does not set baseURL when schemes is empty', () => {
    const source = {
      swagger: '2.0',
      schemes: [],
      host: 'api.example.com',
      paths: {},
    }

    transformBaseURL(source as any)

    expect(configRead.config.meta?.baseURL).toBeUndefined()
  })

  it('does not set baseURL when host is missing', () => {
    const source = {
      swagger: '2.0',
      schemes: ['https'],
      paths: {},
    }

    transformBaseURL(source as any)

    expect(configRead.config.meta?.baseURL).toBeUndefined()
  })

  it('does not override existing baseURL', () => {
    configRead.config.meta = { baseURL: 'https://custom.api.com' }
    const noop = () => {}
    const noopValues = () => []
    provide({
      configRead,
      variables: { add: noop, values: noopValues, all: noopValues },
      interfaces: { add: noop, values: noopValues, all: noopValues },
      functions: { add: noop, values: noopValues, all: noopValues },
      imports: { add: noop, values: noopValues, all: noopValues },
      typings: { add: noop, values: noopValues, all: noopValues },
    })

    const source = {
      swagger: '2.0',
      schemes: ['https'],
      host: 'api.example.com',
      paths: {},
    }

    transformBaseURL(source as any)

    expect(configRead.config.meta.baseURL).toBe('https://custom.api.com')
  })
})
