import type { OpenAPISpecificationV2 } from 'openapi-specification-types'

/**
 * Minimal Swagger 2.0 spec: paths, single operation, responses.
 * Benchmark: OpenAPI 2.0 - Paths Object, Path Item, Operation Object, Responses.
 */
export const swagger2Minimal: OpenAPISpecificationV2 = {
  swagger: '2.0',
  info: { title: 'Minimal API', version: '1.0.0', description: 'Minimal API for testing' },
  host: 'api.example.com',
  basePath: '/v1',
  schemes: ['https'],
  paths: {
    '/pets': {
      get: {
        summary: 'List pets',
        operationId: 'listPets',
        responses: {
          200: { description: 'A list of pets.' },
        },
      },
    },
  },
}
