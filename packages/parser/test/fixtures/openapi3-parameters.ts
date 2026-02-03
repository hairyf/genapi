import type { OpenAPISpecificationV3 } from 'openapi-specification-types'

/**
 * OpenAPI 3.x spec: parameters (path, query, header, cookie), style, explode.
 * Benchmark: OAS 3 - Parameter Object, in, style, schema, content.
 */
export const openapi3Parameters: OpenAPISpecificationV3 = {
  openapi: '3.0.0',
  info: { title: 'Parameters API', version: '1.0.0' },
  servers: [{ url: 'https://api.example.com/v1' }],
  paths: {
    '/pets/{petId}': {
      parameters: [
        { name: 'petId', in: 'path', required: true, schema: { type: 'string' }, description: 'Pet ID' },
      ],
      get: {
        operationId: 'getPet',
        parameters: [
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'tags', in: 'query', style: 'form', explode: true, schema: { type: 'array', items: { type: 'string' } } },
          { name: 'X-Request-ID', in: 'header', schema: { type: 'string' } },
          { name: 'session', in: 'cookie', schema: { type: 'string' } },
        ],
        responses: { 200: { description: 'OK' } },
      },
    },
  },
}
