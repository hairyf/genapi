import type { OpenAPISpecificationV3 } from 'openapi-specification-types'

/**
 * OpenAPI 3.x spec: requestBody with application/json and multipart/form-data.
 * Benchmark: Request Body, Media Type, Encoding.
 */
export const openapi3RequestBody: OpenAPISpecificationV3 = {
  openapi: '3.0.0',
  info: { title: 'RequestBody API', version: '1.0.0' },
  servers: [{ url: 'https://api.example.com/v1' }],
  paths: {
    '/pets': {
      post: {
        operationId: 'createPet',
        requestBody: {
          description: 'Pet to create',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string' },
                  tag: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Created' } },
      },
    },
    '/upload': {
      post: {
        operationId: 'uploadFile',
        requestBody: {
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  file: { type: 'string', format: 'binary' },
                  name: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'OK' } },
      },
    },
  },
}
