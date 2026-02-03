import type { OpenAPISpecificationV2 } from 'openapi-specification-types'

/**
 * Swagger 2.0 spec: definitions, schema composition (allOf), primitives, array, $ref.
 * Benchmark: Schema and Definitions, composition, polymorphism, JSON Schema keywords.
 */
export const swagger2SchemaDefinitions: OpenAPISpecificationV2 = {
  swagger: '2.0',
  info: { title: 'Schema API', version: '1.0.0' },
  host: 'api.example.com',
  basePath: '/v1',
  schemes: ['https'],
  definitions: {
    Category: {
      type: 'object',
      properties: {
        id: { type: 'integer', format: 'int64' },
        name: { type: 'string' },
      },
    },
    Pet: {
      type: 'object',
      required: ['name', 'petType'],
      properties: {
        id: { type: 'integer', format: 'int64' },
        name: { type: 'string' },
        petType: { type: 'string' },
        category: { $ref: '#/definitions/Category' },
      },
      discriminator: 'petType',
    },
    ErrorModel: {
      type: 'object',
      required: ['code', 'message'],
      properties: {
        code: { type: 'integer' },
        message: { type: 'string' },
      },
    },
    ExtendedErrorModel: {
      allOf: [
        { $ref: '#/definitions/ErrorModel' },
        {
          type: 'object',
          required: ['rootCause'],
          properties: { rootCause: { type: 'string' } },
        },
      ],
    },
  },
  paths: {
    '/pets': {
      get: {
        operationId: 'listPets',
        responses: {
          200: {
            description: 'List of pets',
            schema: {
              type: 'array',
              items: { $ref: '#/definitions/Pet' },
            },
          },
          default: {
            description: 'Error',
            schema: { $ref: '#/definitions/ExtendedErrorModel' },
          },
        },
      },
    },
    '/pets/{id}': {
      get: {
        operationId: 'getPetById',
        parameters: [{ name: 'id', in: 'path', required: true, type: 'string' }],
        responses: {
          200: { description: 'OK', schema: { $ref: '#/definitions/Pet' } },
        },
      },
    },
  },
}
