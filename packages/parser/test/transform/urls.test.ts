import { describe, expect, it } from 'vitest'
import {
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
    expect(transformUrlSyntax('/v1/pets', { baseURL: true })).toContain('baseURL')
    expect(transformUrlSyntax('/v1/pets', { baseURL: true })).toContain('/v1/pets')
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
