import type { OpenAPISpecificationV2 } from 'openapi-specification-types'

/**
 * Swagger 2.0 spec covering all parameter locations: path, query, header, body, formData.
 * Benchmark: Parameters - path, query, header, body, formData, collectionFormat, items.
 */
export const swagger2Parameters: OpenAPISpecificationV2 = {
  swagger: '2.0',
  info: { title: 'Params API', version: '1.0.0' },
  host: 'api.example.com',
  basePath: '/v1',
  schemes: ['https'],
  paths: {
    '/pets/{petId}': {
      parameters: [
        { name: 'petId', in: 'path', required: true, type: 'string', description: 'ID of pet' },
      ],
      get: {
        operationId: 'getPet',
        parameters: [
          { name: 'limit', in: 'query', type: 'integer', format: 'int32', description: 'Max items' },
          { name: 'tags', in: 'query', type: 'array', items: { type: 'string' }, collectionFormat: 'csv' },
          { name: 'ids', in: 'query', type: 'array', items: { type: 'string' }, collectionFormat: 'multi' },
          { name: 'X-Request-ID', in: 'header', type: 'string' },
          {
            name: 'body',
            in: 'body',
            required: true,
            schema: { type: 'object', properties: { name: { type: 'string' } } },
          },
        ],
        responses: { 200: { description: 'OK' } },
      },
      post: {
        operationId: 'createPet',
        consumes: ['multipart/form-data', 'application/x-www-form-urlencoded'],
        parameters: [
          { name: 'name', in: 'formData', type: 'string', required: true },
          { name: 'avatar', in: 'formData', type: 'file', required: true },
        ],
        responses: { 201: { description: 'Created' } },
      },
    },
  },
}
