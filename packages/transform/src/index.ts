import { swagger2ToSwagger3 } from './swagger2-to-swagger3'
import { wpapiToSwagger2 } from './wpapi-to-swagger2'

export * from './swagger2-to-swagger3'
export * from './wpapi-to-swagger2'

/**
 * Spec transform helpers: OpenAPI 3 → Swagger 2–like shape, WordPress REST API → Swagger 2.
 * @description Default export provides swagger2ToSwagger3 and wpapiToSwagger2 for normalizing specs before parsing.
 * @example
 * ```ts
 * import genapiTransform from '@genapi/transform'
 * const spec = genapiTransform.swagger2ToSwagger3(openApi3Doc)
 * const swagger = genapiTransform.wpapiToSwagger2(wpApiSchema)
 * ```
 */
export default {
  swagger2ToSwagger3,
  wpapiToSwagger2,
}
