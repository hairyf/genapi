import type { OpenAPISpecificationV3 } from 'openapi-specification-types'

/**
 * Minimal OpenAPI 3.x spec: servers, paths, operation, responses with content.
 * Benchmark: OpenAPI 3.2 - Paths, Operation, Request Body, Responses with content.
 */
export const openapi3Minimal: OpenAPISpecificationV3 = {
  openapi: '3.0.0',
  info: { title: 'Minimal API', version: '1.0.0' },
  servers: [{ url: 'https://api.example.com/v1' }],
  paths: {
    '/pets': {
      get: {
        summary: 'List pets',
        operationId: 'listPets',
        responses: {
          200: {
            description: 'A list of pets.',
            content: {
              'application/json': {
                schema: { type: 'array', items: { type: 'object', properties: { id: { type: 'integer' }, name: { type: 'string' } } } },
              },
            },
          },
        },
      },
    },
  },
}
