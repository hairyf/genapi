import type { OpenAPISpecificationV2 } from 'openapi-specification-types'
import type { OpenAPISpecificationV3 } from 'openapi-specification-types/index-v3'

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
  ].filter(Boolean)
  return comments
}

export function parseOpenAPISpecification32(source: OpenAPISpecificationV2 | OpenAPISpecificationV3) {
  const change = source as OpenAPISpecificationV2
  if (source.openapi?.startsWith('3')) {
    const target = source as OpenAPISpecificationV3
    change.swagger = target.openapi
    change.host = target.servers[0]?.url
    change.basePath = target.servers[0]?.url
    change.schemes = target.servers.map(v => v.url)
    change.info = target.info
    change.paths = target.paths
    change.definitions = target.components.schemas
    change.tags = target.tags
    change.externalDocs = target.externalDocs
  }
  return change
}
