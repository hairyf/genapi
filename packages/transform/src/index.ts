import { swagger2ToSwagger3 } from './swagger2-to-swagger3'
import { wpapiToSwagger2 } from './wpapi-to-swagger2'

export * from './swagger2-to-swagger3'
export * from './wpapi-to-swagger2'

/**
 * Spec transform helpers: OpenAPI 3 → Swagger 2–like shape, WordPress REST API → Swagger 2.
 */
export default {
  swagger2ToSwagger3,
  wpapiToSwagger2,
}
