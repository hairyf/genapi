import type { OpenAPISpecificationV2, OpenAPISpecificationV3 } from 'openapi-specification-types'

/**
 * Normalizes OpenAPI 3.x to a Swagger 2–like shape (host, basePath, schemes, definitions from components.schemas).
 * Mutates and returns the same object for use with Swagger 2–based tooling.
 *
 * @param source - OpenAPI 3.x document
 * @returns Same object with Swagger 2–style fields set
 * @group Transform
 */
export function swagger2ToSwagger3(source: OpenAPISpecificationV3) {
  const change = source as unknown as OpenAPISpecificationV2
  if (source.openapi?.startsWith('3')) {
    const target = source as OpenAPISpecificationV3
    ;(change as { swagger: string }).swagger = target.openapi
    const servers = target.servers ?? []
    change.host = servers[0]?.url
    change.basePath = servers[0]?.url
    ;(change as { schemes: string[] }).schemes = servers.map((v: { url?: string }) => v.url ?? '')
    change.info = target.info
    ;(change as { paths: typeof target.paths }).paths = target.paths ?? {}
    change.definitions = target.components?.schemas ?? {}
    change.tags = target.tags
    change.externalDocs = target.externalDocs
  }
  return change
}
