import { describe, expect, it } from 'vitest'
import { parseHeaderCommits, parseOpenapiSpecification } from '../../src/parses'
import { openapi3Components } from '../fixtures/openapi3-components'
import { openapi3Minimal } from '../fixtures/openapi3-minimal'
import { openapi3Servers } from '../fixtures/openapi3-servers'
import { swagger2Minimal } from '../fixtures/swagger2-minimal'
import { swagger2SchemaDefinitions } from '../fixtures/swagger2-schema-definitions'

describe('parseHeaderCommits', () => {
  it('extracts title, description, swagger, version as comment lines', () => {
    const comments = parseHeaderCommits(swagger2Minimal)
    expect(comments).toContain('@title Minimal API')
    expect(comments).toContain('@description Minimal API for testing')
    expect(comments).toContain('@version 1.0.0')
    expect(comments).toContain('@swagger 2.0')
    expect(comments).toHaveLength(4)
  })

  it('omits missing description', () => {
    const spec = { ...swagger2Minimal, info: { title: 'T', version: '1.0' } }
    const comments = parseHeaderCommits(spec as any)
    expect(comments.filter(Boolean)).toHaveLength(3)
  })
})

describe('parseOpenapiSpecification', () => {
  it('returns Swagger 2 source unchanged when no openapi field', () => {
    const source = swagger2Minimal
    const result = parseOpenapiSpecification(source)
    expect(result).toBe(source)
    expect((result as any).swagger).toBe('2.0')
    expect((result as any).paths).toEqual(swagger2Minimal.paths)
  })

  it('normalizes OpenAPI 3.x to Swagger 2–like shape (host, basePath, definitions)', () => {
    const result = parseOpenapiSpecification(openapi3Minimal)
    expect((result as any).swagger).toBe('3.0.0')
    expect((result as any).host).toBe('https://api.example.com/v1')
    expect((result as any).basePath).toBe('https://api.example.com/v1')
    expect((result as any).info).toEqual(openapi3Minimal.info)
    expect((result as any).paths).toEqual(openapi3Minimal.paths)
    expect((result as any).definitions).toEqual({})
  })

  it('omits @swagger when swagger is falsy', () => {
    const spec = { ...swagger2Minimal, swagger: undefined as any }
    const comments = parseHeaderCommits(spec)
    expect(comments.some(c => c && typeof c === 'string' && c.startsWith('@swagger'))).toBe(false)
  })

  it('normalizes OpenAPI 3.1.x to Swagger 2–like shape', () => {
    const source = {
      openapi: '3.1.0',
      info: { title: 'API', version: '1.0' },
      servers: [{ url: 'https://api.example.com/v1' }],
      paths: { '/ping': { get: { responses: { 200: { description: 'OK' } } } } },
    }
    const result = parseOpenapiSpecification(source as any)
    expect((result as any).swagger).toBe('3.1.0')
    expect((result as any).host).toBe('https://api.example.com/v1')
  })

  it('normalizes OpenAPI 3.2.x to Swagger 2–like shape', () => {
    const source = {
      openapi: '3.2.0',
      info: { title: 'API', version: '1.0' },
      servers: [{ url: 'https://api.example.com/v1' }],
      paths: { '/health': { get: { responses: { 200: { description: 'OK' } } } } },
    }
    const result = parseOpenapiSpecification(source as any)
    expect((result as any).swagger).toBe('3.2.0')
    expect((result as any).host).toBe('https://api.example.com/v1')
  })

  it('preserves definitions when source is Swagger 2', () => {
    const result = parseOpenapiSpecification(swagger2SchemaDefinitions)
    expect((result as any).definitions).toBeDefined()
    expect((result as any).definitions?.Pet).toBeDefined()
    expect((result as any).definitions?.Category).toBeDefined()
  })

  it('sets definitions from components.schemas when source is OAS 3', () => {
    const result = parseOpenapiSpecification(openapi3Components)
    expect((result as any).definitions).toBeDefined()
    expect((result as any).definitions?.Pet).toBeDefined()
    expect((result as any).definitions?.PetList).toBeDefined()
  })

  it('preserves multiple servers and templated server url (OAS 3)', () => {
    const result = parseOpenapiSpecification(openapi3Servers)
    expect((result as any).host).toBe('https://api.example.com/v1')
    expect((result as any).schemes).toContain('https://api.example.com/v1')
    expect((result as any).schemes).toContain('https://staging.example.com/v1')
    expect((result as any).schemes).toContain('https://{env}.example.com/{basePath}')
  })
})
