import type { OpenAPISpecificationV3 } from 'openapi-specification-types'

/**
 * OpenAPI 3.x spec: multiple servers, server variables (templated URL).
 * Benchmark: OAS 3 - Server Object, Server Variable.
 */
export const openapi3Servers: OpenAPISpecificationV3 = {
  openapi: '3.0.0',
  info: { title: 'Servers API', version: '1.0.0' },
  servers: [
    { url: 'https://api.example.com/v1', description: 'Production' },
    { url: 'https://staging.example.com/v1', description: 'Staging' },
    {
      url: 'https://{env}.example.com/{basePath}',
      description: 'Variable',
      variables: {
        env: { default: 'api' },
        basePath: { default: 'v1' },
      },
    },
  ],
  paths: {
    '/ping': {
      get: {
        operationId: 'ping',
        responses: { 200: { description: 'OK' } },
      },
    },
  },
}
