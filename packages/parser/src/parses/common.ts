import type { OpenAPISpecificationV2, OpenAPISpecificationV3 } from 'openapi-specification-types'

import { swagger2ToSwagger3 } from '@genapi/transform'

/**
 * parse OpenAPI info to commits
 * @param source
 */
export function parseHeaderCommits(source: OpenAPISpecificationV2) {
  const comments = [
    `@title ${source.info.title}`,
    `@description ${source.info.description}`,
    source.swagger && `@swagger ${source.swagger}`,
    `@version ${source.info.version}`,
  ].filter(Boolean)
  return comments
}

export function parseOpenapiSpecification(source: OpenAPISpecificationV2 | OpenAPISpecificationV3) {
  return source.openapi?.startsWith('3')
    ? swagger2ToSwagger3(source as OpenAPISpecificationV3)
    : source as OpenAPISpecificationV2
}
