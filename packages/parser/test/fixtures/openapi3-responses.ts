import type { OpenAPISpecificationV3 } from 'openapi-specification-types'

/**
 * OpenAPI 3.x spec: responses with default, multiple content types, headers.
 * Benchmark: OAS 3 - Responses Object, Response with content, headers, default.
 */
export const openapi3Responses: OpenAPISpecificationV3 = {
  openapi: '3.0.0',
  info: { title: 'Responses API', version: '1.0.0' },
  servers: [{ url: 'https://api.example.com/v1' }],
  paths: {
    '/pets': {
      get: {
        operationId: 'listPets',
        responses: {
          200: {
            description: 'Success',
            headers: {
              'X-Request-Id': { description: 'Request ID', schema: { type: 'string' } },
            },
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Pet' } },
              },
              'text/plain': {
                schema: { type: 'string' },
              },
            },
          },
          default: {
            description: 'Error',
            content: {
              'application/json': {
                schema: { type: 'object', properties: { code: { type: 'integer' }, message: { type: 'string' } } },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      Pet: {
        type: 'object',
        properties: { id: { type: 'integer' }, name: { type: 'string' } },
      },
    },
  },
}
