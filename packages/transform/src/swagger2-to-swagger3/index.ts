import type { OpenAPISpecificationV2 } from 'openapi-specification-types'
import type { OpenAPISpecificationV3 } from 'openapi-specification-types/index-v3'

export function swagger2ToSwagger3(source: OpenAPISpecificationV3) {
  const change = source as unknown as OpenAPISpecificationV2
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
