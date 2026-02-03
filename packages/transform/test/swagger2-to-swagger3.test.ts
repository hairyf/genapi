import { describe, expect, it } from 'vitest'
import { swagger2ToSwagger3 } from '../src/swagger2-to-swagger3'
import { openapi3Minimal } from './fixtures/openapi3-minimal'

describe('swagger2ToSwagger3', () => {
  it('sets swagger from openapi when source is 3.x', () => {
    const source = { ...openapi3Minimal }
    const result = swagger2ToSwagger3(source)
    expect((result as any).swagger).toBe('3.0.0')
  })

  it('sets host from first server url', () => {
    const source = { ...openapi3Minimal }
    const result = swagger2ToSwagger3(source)
    expect((result as any).host).toBe('https://api.example.com/v1')
  })

  it('sets basePath from first server url', () => {
    const result = swagger2ToSwagger3({ ...openapi3Minimal })
    expect((result as any).basePath).toBe('https://api.example.com/v1')
  })

  it('sets schemes from all server urls', () => {
    const result = swagger2ToSwagger3({ ...openapi3Minimal })
    expect((result as any).schemes).toEqual([
      'https://api.example.com/v1',
      'https://staging.example.com/v1',
    ])
  })

  it('copies info', () => {
    const result = swagger2ToSwagger3({ ...openapi3Minimal })
    expect((result as any).info).toEqual(openapi3Minimal.info)
  })

  it('copies paths', () => {
    const result = swagger2ToSwagger3({ ...openapi3Minimal })
    expect((result as any).paths).toEqual(openapi3Minimal.paths)
  })

  it('sets definitions from components.schemas', () => {
    const result = swagger2ToSwagger3({ ...openapi3Minimal })
    expect((result as any).definitions).toEqual(openapi3Minimal.components!.schemas)
    expect((result as any).definitions.Pet).toBeDefined()
  })

  it('sets definitions to {} when no components.schemas', () => {
    const source = {
      openapi: '3.0.0',
      info: { title: 'T', version: '1.0' },
      servers: [{ url: 'https://api.example.com' }],
      paths: {},
    }
    const result = swagger2ToSwagger3(source as any)
    expect((result as any).definitions).toEqual({})
  })

  it('copies tags and externalDocs', () => {
    const source = {
      ...openapi3Minimal,
      tags: [{ name: 'pets', description: 'Pets' }],
      externalDocs: { url: 'https://docs.example.com' },
    }
    const result = swagger2ToSwagger3(source)
    expect((result as any).tags).toEqual(source.tags)
    expect((result as any).externalDocs).toEqual(source.externalDocs)
  })

  it('mutates and returns same object', () => {
    const source = { ...openapi3Minimal }
    const result = swagger2ToSwagger3(source)
    expect(result).toBe(source)
  })

  it('handles empty servers array', () => {
    const source = {
      openapi: '3.0.0',
      info: { title: 'T', version: '1.0' },
      servers: [],
      paths: {},
    }
    const result = swagger2ToSwagger3(source as any)
    expect((result as any).host).toBeUndefined()
    expect((result as any).basePath).toBeUndefined()
    expect((result as any).schemes).toEqual([])
  })

  it('handles servers with undefined url', () => {
    const source = {
      openapi: '3.0.0',
      info: { title: 'T', version: '1.0' },
      servers: [{ url: undefined }, { url: 'https://api.example.com' }],
      paths: {},
    }
    const result = swagger2ToSwagger3(source as any)
    expect((result as any).host).toBeUndefined()
    expect((result as any).schemes).toContain('')
    expect((result as any).schemes).toContain('https://api.example.com')
  })

  it('handles openapi 3.1.0 version string', () => {
    const source = {
      openapi: '3.1.0',
      info: { title: 'T', version: '1.0' },
      servers: [{ url: 'https://api.example.com' }],
      paths: {},
    }
    const result = swagger2ToSwagger3(source as any)
    expect((result as any).swagger).toBe('3.1.0')
    expect((result as any).host).toBe('https://api.example.com')
  })

  it('handles openapi 3.2.0 version string', () => {
    const source = {
      openapi: '3.2.0',
      info: { title: 'T', version: '1.0' },
      servers: [{ url: 'https://api.example.com' }],
      paths: {},
    }
    const result = swagger2ToSwagger3(source as any)
    expect((result as any).swagger).toBe('3.2.0')
  })

  it('preserves server url with template variables', () => {
    const source = {
      openapi: '3.0.0',
      info: { title: 'T', version: '1.0' },
      servers: [{ url: 'https://{env}.example.com/{basePath}', variables: { env: { default: 'api' }, basePath: { default: 'v1' } } }],
      paths: {},
    }
    const result = swagger2ToSwagger3(source as any)
    expect((result as any).host).toBe('https://{env}.example.com/{basePath}')
    expect((result as any).schemes).toContain('https://{env}.example.com/{basePath}')
  })

  it('does not set Swagger 2–like fields when openapi does not start with 3', () => {
    const source = { openapi: '2.0', info: { title: 'T', version: '1.0' }, paths: {} }
    const result = swagger2ToSwagger3(source as any)
    expect(result).toBe(source)
    expect((result as any).swagger).toBeUndefined()
    expect((result as any).host).toBeUndefined()
  })
})
