import type { WordPressAPISchema } from '../src/wpapi-to-swagger2/types'
import { describe, expect, it } from 'vitest'
import {
  convertEndpoint,
  getParametersFromArgs,
  getParametersFromEndpoint,
  wpapiToSwagger2,
} from '../src/wpapi-to-swagger2'

describe('convertEndpoint', () => {
  it('converts WordPress pattern (?P<name>...) to {name}', () => {
    expect(convertEndpoint('/wp/v2/posts/(?P<id>[\\d]+)')).toBe('/wp/v2/posts/{id}')
  })

  it('converts multiple path params', () => {
    expect(convertEndpoint('/wp/v2/(?P<type>[a-z]+)/(?P<id>[\\d]+)')).toBe('/wp/v2/{type}/{id}')
  })

  it('returns path unchanged when no (?P<', () => {
    expect(convertEndpoint('/wp/v2/posts')).toBe('/wp/v2/posts')
  })
})

describe('getParametersFromEndpoint', () => {
  it('extracts path parameters with type from pattern', () => {
    const params = getParametersFromEndpoint('/wp/v2/posts/(?P<id>[\\d]+)')
    expect(params).toHaveLength(1)
    expect(params[0].name).toBe('id')
    expect(params[0].in).toBe('path')
    expect(params[0].required).toBe(true)
    expect(params[0].type).toBe('integer')
    expect(params[0].format).toBe('int64')
  })

  it('uses string type for non-digit pattern', () => {
    const params = getParametersFromEndpoint('/wp/v2/(?P<slug>[a-z-]+)')
    expect(params).toHaveLength(1)
    expect(params[0].type).toBe('string')
  })

  it('returns empty array when no path params', () => {
    expect(getParametersFromEndpoint('/wp/v2/posts')).toHaveLength(0)
  })

  it('extracts multiple path parameters (type and id)', () => {
    const params = getParametersFromEndpoint('/wp/v2/(?P<type>[a-z]+)/(?P<id>[\\d]+)')
    expect(params).toHaveLength(2)
    expect(params.map(p => p.name)).toEqual(['type', 'id'])
    expect(params[0].type).toBe('string')
    expect(params[1].type).toBe('integer')
  })
})

describe('getParametersFromArgs', () => {
  it('builds query parameter from args', () => {
    const params = getParametersFromArgs(
      '/wp/v2/posts',
      {
        per_page: { type: 'integer', description: 'Per page' },
        search: { type: 'string' },
      },
      'get',
    )
    expect(params).toHaveLength(2)
    const perPage = params.find(p => p.name === 'per_page')
    expect(perPage?.type).toBe('integer')
    expect(perPage?.in).toBe('query')
    expect(perPage?.description).toBe('Per page')
  })

  it('builds path parameter when name in path', () => {
    const params = getParametersFromArgs(
      '/wp/v2/posts/{id}',
      { id: { type: 'integer', required: true } },
      'get',
    )
    expect(params).toHaveLength(1)
    expect(params[0].in).toBe('path')
    expect(params[0].required).toBe(true)
  })

  it('builds formData for POST/PUT when not in path', () => {
    const params = getParametersFromArgs(
      '/wp/v2/posts',
      { title: { type: 'string', required: true } },
      'post',
    )
    expect(params).toHaveLength(1)
    expect(params[0].in).toBe('formData')
  })

  it('handles enum in args', () => {
    const params = getParametersFromArgs(
      '/wp/v2/posts',
      { orderby: { type: 'string', enum: ['date', 'title'] } },
      'get',
    )
    expect(params).toHaveLength(1)
    expect(params[0].type).toBe('array')
    expect(params[0].items?.enum).toEqual(['date', 'title'])
    expect(params[0].collectionFormat).toBe('multi')
  })
})

describe('wpapiToSwagger2', () => {
  it('produces valid Swagger 2.0 root', () => {
    const schema: WordPressAPISchema = {
      routes: {
        '/wp/v2': {
          namespace: 'wp/v2',
          endpoints: [
            {
              methods: ['get'],
              description: 'List posts',
              args: {
                per_page: { type: 'integer' },
              },
            },
          ],
        },
      },
    }
    const swagger = wpapiToSwagger2(schema)
    expect(swagger.swagger).toBe('2.0')
    expect(swagger.info.title).toBe('WordPress REST API')
    expect(swagger.paths).toBeDefined()
    expect(swagger.definitions).toEqual({})
    expect(swagger.schemes).toContain('https')
    expect(swagger.securityDefinitions?.basic).toBeDefined()
  })

  it('converts path and creates operation per method', () => {
    const schema: WordPressAPISchema = {
      routes: {
        '/wp/v2': {
          namespace: 'wp/v2',
          endpoints: [
            {
              methods: ['get', 'post'],
              description: 'Posts',
              args: { per_page: { type: 'integer' } },
            },
          ],
        },
      },
    }
    const swagger = wpapiToSwagger2(schema)
    const pathKey = Object.keys(swagger.paths!)[0]
    expect(pathKey).toBe('/wp/v2')
    const pathItem = swagger.paths![pathKey] as any
    expect(pathItem.get).toBeDefined()
    expect(pathItem.post).toBeDefined()
    expect(pathItem.get.operationId).toBeDefined()
    expect(pathItem.get.responses).toHaveProperty('200')
    expect(pathItem.get.parameters).toBeDefined()
  })

  it('merges path params from endpoint pattern with args', () => {
    const schema: WordPressAPISchema = {
      routes: {
        '/wp/v2': {
          namespace: 'wp/v2',
          endpoints: [
            {
              methods: ['get'],
              args: {},
            },
          ],
        },
      },
    }
    // Override route path to include pattern
    const routes = schema.routes as any
    routes['/wp/v2/posts/(?P<id>[\\d]+)'] = {
      namespace: 'wp/v2',
      endpoints: [{ methods: ['get'], args: {} }],
    }
    const swagger = wpapiToSwagger2(schema)
    const pathKey = '/wp/v2/posts/{id}'
    const pathItem = swagger.paths![pathKey] as any
    expect(pathItem).toBeDefined()
    const getOp = pathItem?.get
    expect(getOp?.parameters?.some((p: any) => p.name === 'id' && p.in === 'path')).toBe(true)
  })

  it('sets tags from namespace', () => {
    const schema: WordPressAPISchema = {
      routes: {
        '/wp/v2': {
          namespace: 'wp/v2',
          endpoints: [{ methods: ['get'], args: {} }],
        },
      },
    }
    const swagger = wpapiToSwagger2(schema)
    const pathItem = Object.values(swagger.paths!)[0] as any
    expect(pathItem.get.tags).toEqual(['wp/v2'])
  })

  it('handles empty routes', () => {
    const schema: WordPressAPISchema = { routes: {} }
    const swagger = wpapiToSwagger2(schema)
    expect(swagger.paths).toEqual({})
    expect(swagger.swagger).toBe('2.0')
  })

  it('handles endpoint without args', () => {
    const schema: WordPressAPISchema = {
      routes: {
        '/wp/v2': {
          namespace: 'wp/v2',
          endpoints: [{ methods: ['get'], description: 'List' }],
        },
      },
    }
    const swagger = wpapiToSwagger2(schema)
    const pathItem = Object.values(swagger.paths!)[0] as any
    expect(pathItem.get).toBeDefined()
    expect(pathItem.get.parameters).toEqual([])
  })

  it('handles buildParam with minimum and maximum', () => {
    const params = getParametersFromArgs(
      '/wp/v2/posts',
      { per_page: { type: 'integer', minimum: 1, maximum: 100 } },
      'get',
    )
    expect(params).toHaveLength(1)
    expect(params[0].minimum).toBe(1)
    expect(params[0].maximum).toBe(100)
  })

  it('sets consumes and produces', () => {
    const schema: WordPressAPISchema = {
      routes: {
        '/wp/v2': {
          namespace: 'wp/v2',
          endpoints: [{ methods: ['post'], args: { title: { type: 'string' } } }],
        },
      },
    }
    const swagger = wpapiToSwagger2(schema)
    const pathItem = Object.values(swagger.paths!)[0] as any
    expect(pathItem.post.consumes).toContain('application/json')
    expect(pathItem.post.produces).toContain('application/json')
  })
})
