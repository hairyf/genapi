import type { OpenAPISpecificationV2, Responses, Security } from 'openapi-specification-types'
import type { WordPressAPISchema, WordPressRoute } from './types'
import { convertEndpoint, getParametersFromArgs, getParametersFromEndpoint } from './utils'

/**
 * Converts a WordPress REST API schema to Swagger 2.0 format.
 *
 * @param source - WordPress REST API schema (routes + endpoints)
 * @returns Swagger 2.0 document
 * @group Transform
 */
export function wpapiToSwagger2(source: WordPressAPISchema): OpenAPISpecificationV2 {
  const swagger: OpenAPISpecificationV2 = {
    swagger: '2.0',
    basePath: '',
    host: '',
    info: {
      title: 'WordPress REST API',
      version: '1.0',
      description: 'Using the WordPress REST API you can create a plugin to provide an entirely new admin experience for WordPress, build a brand new interactive front-end experience, or bring your WordPress content into completely separate applications.',
    } as any,
    definitions: {},
    consumes: [],
    externalDocs: {} as any,
    paths: {},
    schemes: ['https', 'http'],
    securityDefinitions: {
      basic: {
        type: 'basic',
        description: 'Basic authentication',
      },
    } as any,
    tags: [],
  }

  // Process paths and endpoints
  for (const [path, route] of Object.entries<WordPressRoute>(source.routes)) {
    for (const endpoint of route.endpoints) {
      const methods = endpoint.methods

      // Check if path contains parameters
      const convertedPath = convertEndpoint(path)

      // Extract parameters from path
      const pathParameters = getParametersFromEndpoint(path)

      for (const method of methods) {
        // Get parameters
        const parameters = getParametersFromArgs(
          convertedPath,
          endpoint.args || {},
          method,
        )

        // Merge path parameters and request parameters
        const allParameters = [...parameters]
        const existingNames = new Set(parameters.map(param => param.name))

        // Add only parameters with unique names
        for (const param of pathParameters) {
          if (!existingNames.has(param.name))
            allParameters.push(param)
        }

        // Set tags, default to namespace
        const tags = [route.namespace]

        // Set responses
        const responses: Responses = {
          200: { description: 'OK' },
          400: { description: 'Bad Request' },
          404: { description: 'Not Found' },
        } as any

        // Set content types for consumption and production
        const consumes = [
          'application/json',
          'application/x-www-form-urlencoded',
          'multipart/form-data',
        ]

        const produces = ['application/json']

        // Set security definitions
        const security: Security[] = [{ basic: [] }] as any

        // Create operation ID
        const operationId = `${method}${convertedPath.replace(/\//g, '_').replace(/\{|\}/g, '')}`

        // Initialize path object if it doesn't exist
        swagger.paths[convertedPath] = swagger.paths[convertedPath] ?? {}

        // Add method to path
        swagger.paths[convertedPath][method] = {
          tags,
          summary: endpoint.description || '',
          description: endpoint.description || '',
          operationId,
          consumes,
          produces,
          parameters: allParameters,
          responses,
          security,
        }
      }
    }
  }

  return swagger
}

export * from './utils'
