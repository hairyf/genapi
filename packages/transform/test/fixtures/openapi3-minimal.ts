import type { OpenAPISpecificationV3 } from 'openapi-specification-types'

export const openapi3Minimal: OpenAPISpecificationV3 = {
  openapi: '3.0.0',
  info: { title: 'Minimal API', version: '1.0.0' },
  servers: [
    { url: 'https://api.example.com/v1' },
    { url: 'https://staging.example.com/v1' },
  ],
  paths: {
    '/pets': {
      get: {
        summary: 'List pets',
        operationId: 'listPets',
        responses: { 200: { description: 'OK' } },
      },
    },
  },
  components: {
    schemas: {
      Pet: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
        },
      },
    },
  },
}
