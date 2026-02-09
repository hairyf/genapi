import * as axios from './axios'
import * as fetch from './fetch'
import * as got from './got'
import * as ky from './ky'
import * as ofetch from './ofetch'
import * as tanstackQuery from './tanstack'
import * as uni from './uni'

export {
  axios,
  fetch,
  got,
  ky,
  ofetch,
  tanstackQuery,
  uni,
}

/**
 * Preset pipelines by HTTP client: axios, fetch, ky, got, ofetch, tanstack (react/vue/colada), uni.
 * @description Each key exposes `.ts` and `.js` pipeline modules (e.g. use `@genapi/presets/swag-axios-ts`).
 * @example
 * ```ts
 * import presets from '@genapi/presets'
 * // presets.axios, presets.fetch, presets.ofetch, presets.tanstackQuery, presets.uni, presets.colada
 * ```
 */
export default {
  tanstackQuery,
  ofetch,
  axios,
  fetch,
  uni,
  got,
  ky,
}
