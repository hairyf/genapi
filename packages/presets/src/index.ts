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
 * Preset pipelines by HTTP client: axios, fetch, ky, got, ofetch, react-query, vue-query, uni.
 * Each key has `.ts` and `.js` (e.g. `presets.axios.ts`, `presets.axios.js`).
 */
export default {
  axios,
  fetch,
  got,
  ky,
  ofetch,
  tanstackQuery,
  uni,
}
