import type { OpenAPISpecificationV2, OpenAPISpecificationV3 } from 'openapi-specification-types'

import { swagger2ToSwagger3 } from '@genapi/transform'

/**
 * Extracts OpenAPI info (title, description, swagger, version) into comment lines for generated file header.
 *
 * @param source - Swagger 2.0 / OpenAPI spec
 * @returns Array of comment strings (e.g. `@title API`, `@version 1.0`)
 * @example
 * ```ts
 * const comments = parseHeaderCommits(swaggerSpec)
 * // ['@title My API', '@swagger 2.0', '@version 1.0']
 * ```
 */
export function parseHeaderCommits(source: OpenAPISpecificationV2): string[] {
  const comments = [
    `@title ${source.info.title}`,
    source.info.description != null && source.info.description !== '' && `@description ${source.info.description}`,
    source.swagger && `@swagger ${source.swagger}`,
    `@version ${source.info.version}`,
  ].filter((comment): comment is string => typeof comment === 'string')
  return comments
}

/**
 * Normalizes input spec to Swagger 2–like shape: passes through Swagger 2 or converts OpenAPI 3.x via swagger2ToSwagger3.
 *
 * @param source - OpenAPI 2.0 or 3.x specification
 * @returns Same or normalized spec in Swagger 2–style (host, basePath, definitions, etc.)
 * @example
 * ```ts
 * const spec = parseOpenapiSpecification(openApi3Doc)
 * // spec has host, basePath, definitions for downstream parser
 * ```
 */
export function parseOpenapiSpecification(source: OpenAPISpecificationV2 | OpenAPISpecificationV3) {
  return source.openapi?.startsWith('3')
    ? swagger2ToSwagger3(source as OpenAPISpecificationV3)
    : source as OpenAPISpecificationV2
}
