import type { PathMethod } from '../../src/traverse/paths'
import { describe, expect, it } from 'vitest'
import { traversePaths } from '../../src/traverse/paths'
import { openapi3Parameters } from '../fixtures/openapi3-parameters'
import { openapi3RequestBody } from '../fixtures/openapi3-request-body'
import { openapi3Responses } from '../fixtures/openapi3-responses'
import { swagger2Minimal } from '../fixtures/swagger2-minimal'
import { swagger2Parameters } from '../fixtures/swagger2-parameters'

describe('traversePaths', () => {
  it('invokes callback for each path and method', () => {
    const collected: PathMethod[] = []
    traversePaths(swagger2Minimal.paths!, config => collected.push(config))
    expect(collected).toHaveLength(1)
    expect(collected[0].path).toBe('/pets')
    expect(collected[0].method).toBe('get')
    expect(collected[0].options.operationId).toBe('listPets')
    expect(collected[0].responses).toHaveProperty('200')
  })

  it('merges path-level and operation-level parameters', () => {
    const collected: PathMethod[] = []
    traversePaths(swagger2Parameters.paths!, config => collected.push(config))
    const getPet = collected.find(c => c.method === 'get' && c.path === '/pets/{petId}')
    expect(getPet).toBeDefined()
    const paramNames = getPet!.parameters.map(p => p.name)
    expect(paramNames).toContain('petId')
    expect(paramNames).toContain('limit')
    expect(paramNames).toContain('body')
  })

  it('operation-level parameter overrides path-level same name+in', () => {
    const paths = {
      '/foo/{id}': {
        parameters: [{ name: 'id', in: 'path', required: true, type: 'string' }],
        get: {
          responses: { 200: { description: 'OK' } },
          parameters: [{ name: 'id', in: 'path', required: true, type: 'integer' }],
        },
      },
    }
    const collected: PathMethod[] = []
    traversePaths(paths as any, config => collected.push(config))
    expect(collected[0].parameters).toHaveLength(1)
    expect(collected[0].parameters[0].type).toBe('integer')
  })

  it('skips path value that is string or array (e.g. $ref or invalid)', () => {
    const paths = {
      '/valid': {
        get: { responses: { 200: { description: 'OK' } } },
      },
      '/ref': 'https://external.com/path',
      '/array': [],
    }
    const collected: PathMethod[] = []
    traversePaths(paths as any, config => collected.push(config))
    expect(collected).toHaveLength(1)
    expect(collected[0].path).toBe('/valid')
  })

  it('skips non-operation values (no responses)', () => {
    const paths = {
      '/foo': {
        parameters: [],
        get: { summary: 'no responses' },
      },
    }
    const collected: PathMethod[] = []
    traversePaths(paths as any, config => collected.push(config))
    expect(collected).toHaveLength(0)
  })

  it('extends parameters from OpenAPI 3 requestBody application/json', () => {
    const paths = openapi3RequestBody.paths!
    const collected: PathMethod[] = []
    traversePaths(paths, config => collected.push(config))
    const createPet = collected.find(c => c.options.operationId === 'createPet')
    expect(createPet).toBeDefined()
    const bodyParam = createPet!.parameters.find(p => p.in === 'body')
    expect(bodyParam).toBeDefined()
    expect(bodyParam!.name).toBe('body')
  })

  it('handles requestBody without content', () => {
    const paths = {
      '/upload': {
        post: {
          requestBody: {},
          responses: { 200: { description: 'OK' } },
        },
      },
    }
    const collected: PathMethod[] = []
    traversePaths(paths as any, config => collected.push(config))
    expect(collected).toHaveLength(1)
    expect(collected[0].parameters).toBeDefined()
  })

  it('handles requestBody with content but no multipart/form-data', () => {
    const paths = {
      '/upload': {
        post: {
          requestBody: {
            content: {
              'application/json': {
                schema: { type: 'object' },
              },
            },
          },
          responses: { 200: { description: 'OK' } },
        },
      },
    }
    const collected: PathMethod[] = []
    traversePaths(paths as any, config => collected.push(config))
    expect(collected).toHaveLength(1)
  })

  it('handles requestBody with multipart/form-data but no schema', () => {
    const paths = {
      '/upload': {
        post: {
          requestBody: {
            content: {
              'multipart/form-data': {},
            },
          },
          responses: { 200: { description: 'OK' } },
        },
      },
    }
    const collected: PathMethod[] = []
    traversePaths(paths as any, config => collected.push(config))
    expect(collected).toHaveLength(1)
  })

  it('extends parameters from OpenAPI 3 requestBody multipart/form-data', () => {
    const paths = openapi3RequestBody.paths!
    const collected: PathMethod[] = []
    traversePaths(paths, config => collected.push(config))
    const upload = collected.find(c => c.options.operationId === 'uploadFile')
    expect(upload).toBeDefined()
    const formParams = upload!.parameters.filter(p => p.in === 'formData')
    expect(formParams.length).toBeGreaterThanOrEqual(1)
    expect(formParams.some(p => p.name === 'file' || p.name === 'name')).toBe(true)
  })

  it('handles empty paths object', () => {
    const collected: PathMethod[] = []
    traversePaths({}, config => collected.push(config))
    expect(collected).toHaveLength(0)
  })

  it('handles path with only path-level parameters (no operation params)', () => {
    const paths = {
      '/foo/{id}': {
        parameters: [{ name: 'id', in: 'path', required: true, type: 'string' }],
        get: { responses: { 200: { description: 'OK' } } },
      },
    }
    const collected: PathMethod[] = []
    traversePaths(paths as any, config => collected.push(config))
    expect(collected).toHaveLength(1)
    expect(collected[0].parameters).toHaveLength(1)
    expect(collected[0].parameters[0].name).toBe('id')
  })

  it('does not add body param when requestBody has only non-json/non-multipart content', () => {
    const paths = {
      '/upload': {
        post: {
          responses: { 200: { description: 'OK' } },
          requestBody: {
            content: {
              'application/xml': { schema: { type: 'object', properties: { x: { type: 'string' } } } },
            },
          },
        },
      },
    }
    const collected: PathMethod[] = []
    traversePaths(paths as any, config => collected.push(config))
    expect(collected).toHaveLength(1)
    const bodyParam = collected[0].parameters.find(p => p.in === 'body')
    expect(bodyParam).toBeUndefined()
  })

  it('does not add formData params when multipart schema has no properties', () => {
    const paths = {
      '/empty': {
        post: {
          responses: { 200: { description: 'OK' } },
          requestBody: {
            content: {
              'multipart/form-data': { schema: { type: 'object' } },
            },
          },
        },
      },
    }
    const collected: PathMethod[] = []
    traversePaths(paths as any, config => collected.push(config))
    expect(collected).toHaveLength(1)
    const formParams = collected[0].parameters.filter(p => p.in === 'formData')
    expect(formParams).toHaveLength(0)
  })

  it('filters out path-level $ref parameters (only resolved params in callback)', () => {
    const paths = {
      '/foo/{id}': {
        parameters: [
          { $ref: '#/parameters/CommonId' },
          { name: 'id', in: 'path', required: true, type: 'string' },
        ],
        get: { responses: { 200: { description: 'OK' } } },
      },
    }
    const collected: PathMethod[] = []
    traversePaths(paths as any, config => collected.push(config))
    expect(collected).toHaveLength(1)
    expect(collected[0].parameters).toHaveLength(1)
    expect(collected[0].parameters[0].name).toBe('id')
  })

  it('handles path with multiple path parameters', () => {
    const paths = {
      '/pets/{ownerId}/items/{itemId}': {
        parameters: [
          { name: 'ownerId', in: 'path', required: true, type: 'string' },
          { name: 'itemId', in: 'path', required: true, type: 'string' },
        ],
        get: { responses: { 200: { description: 'OK' } } },
      },
    }
    const collected: PathMethod[] = []
    traversePaths(paths as any, config => collected.push(config))
    expect(collected[0].parameters).toHaveLength(2)
    const names = collected[0].parameters.map(p => p.name)
    expect(names).toContain('ownerId')
    expect(names).toContain('itemId')
  })

  it('oAS 3: response with default and 200 both have content', () => {
    const paths = openapi3Responses.paths!
    const collected: PathMethod[] = []
    traversePaths(paths, config => collected.push(config))
    expect(collected).toHaveLength(1)
    expect(collected[0].responses).toHaveProperty('200')
    expect(collected[0].responses).toHaveProperty('default')
    const res200 = collected[0].responses['200'] as any
    expect(res200?.content?.['application/json']).toBeDefined()
    expect(res200?.content?.['text/plain']).toBeDefined()
    expect(res200?.headers).toBeDefined()
  })

  it('oAS 3: path and operation parameters (query, header, cookie) merged', () => {
    const paths = openapi3Parameters.paths!
    const collected: PathMethod[] = []
    traversePaths(paths, config => collected.push(config))
    expect(collected).toHaveLength(1)
    const params = collected[0].parameters
    const names = params.map(p => p.name)
    expect(names).toContain('petId')
    expect(names).toContain('limit')
    expect(names).toContain('tags')
    expect(names).toContain('X-Request-ID')
    expect(names).toContain('session')
  })

  it('oAS 3: requestBody with application/x-www-form-urlencoded does not add body param', () => {
    const paths = {
      '/form': {
        post: {
          operationId: 'submitForm',
          requestBody: {
            content: {
              'application/x-www-form-urlencoded': {
                schema: { type: 'object', properties: { name: { type: 'string' } } },
              },
            },
          },
          responses: { 200: { description: 'OK' } },
        },
      },
    }
    const collected: PathMethod[] = []
    traversePaths(paths as any, config => collected.push(config))
    expect(collected).toHaveLength(1)
    const bodyParam = collected[0].parameters.find(p => p.in === 'body')
    expect(bodyParam).toBeUndefined()
  })

  it('oAS 3: operation with tags and deprecated in options', () => {
    const paths = {
      '/legacy': {
        get: {
          operationId: 'legacyGet',
          tags: ['legacy'],
          deprecated: true,
          responses: { 200: { description: 'OK' } },
        },
      },
    }
    const collected: PathMethod[] = []
    traversePaths(paths as any, config => collected.push(config))
    expect(collected[0].options.tags).toEqual(['legacy'])
    expect((collected[0].options as any).deprecated).toBe(true)
  })

  it('iterates all HTTP methods when present', () => {
    const paths = {
      '/multi': {
        get: { responses: { 200: { description: 'OK' } } },
        post: { responses: { 201: { description: 'Created' } } },
        put: { responses: { 200: { description: 'OK' } } },
        delete: { responses: { 204: { description: 'No Content' } } },
        patch: { responses: { 200: { description: 'OK' } } },
        head: { responses: { 200: { description: 'OK' } } },
        options: { responses: { 200: { description: 'OK' } } },
      },
    }
    const collected: PathMethod[] = []
    traversePaths(paths as any, config => collected.push(config))
    const methods = collected.map(c => c.method)
    expect(methods).toContain('get')
    expect(methods).toContain('post')
    expect(methods).toContain('put')
    expect(methods).toContain('delete')
    expect(methods).toContain('patch')
    expect(methods).toContain('head')
    expect(methods).toContain('options')
    expect(collected).toHaveLength(7)
  })
})
