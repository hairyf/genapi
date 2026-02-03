import type { OpenAPISpecificationV3 } from 'openapi-specification-types'

/**
 * OpenAPI 3.x spec: components.schemas, securitySchemes, tags, externalDocs.
 * Benchmark: OAS 3 - Components, Security Schemes, Tags.
 */
export const openapi3Components: OpenAPISpecificationV3 = {
  openapi: '3.0.0',
  info: { title: 'Components API', version: '1.0.0' },
  servers: [{ url: 'https://api.example.com/v1' }],
  paths: {
    '/pets': {
      get: {
        operationId: 'listPets',
        tags: ['pets'],
        security: [{ petstore_auth: ['read:pets'] }],
        responses: { 200: { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/PetList' } } } } },
      },
    },
  },
  components: {
    schemas: {
      Pet: {
        type: 'object',
        properties: { id: { type: 'integer' }, name: { type: 'string' } },
      },
      PetList: {
        type: 'array',
        items: { $ref: '#/components/schemas/Pet' },
      },
    },
    securitySchemes: {
      petstore_auth: {
        type: 'oauth2',
        flows: { implicit: { authorizationUrl: 'https://example.com/oauth', scopes: { 'read:pets': 'read pets' } } },
      },
      api_key: {
        type: 'apiKey',
        in: 'header',
        name: 'X-API-Key',
      },
    },
  },
  tags: [{ name: 'pets', description: 'Pet operations' }],
  externalDocs: { url: 'https://docs.example.com', description: 'API docs' },
}
