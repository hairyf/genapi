import type { OpenAPISpecificationV2 } from 'openapi-specification-types'

/**
 * parse OpenAPI info to commits
 * @param source
 * @returns
 */
export function parseHeaderCommits(source: OpenAPISpecificationV2) {
  const comments = [
    `@title ${source.info.title}`,
    `@description ${source.info.description}`,
    source.swagger && `@swagger ${source.swagger}`,
    `@version ${source.info.version}`,
  ]
  return comments
}
