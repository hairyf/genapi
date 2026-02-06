import type { ApiPipeline } from '@genapi/shared'
import { wpapiToSwagger2 } from '@genapi/transform'
import { ofetch } from 'ofetch'

/**
 * Fetches source: resolves uri/http/json from configRead.inputs and sets configRead.source.
 * Transforms the source based on parser configuration (wpapi -> swagger2, swagger -> unchanged).
 *
 * @param configRead - ConfigRead with inputs (uri, http, or json)
 * @returns Same configRead with source set and transformed if needed
 * @group Pipeline
 */
export async function original(configRead: ApiPipeline.ConfigRead) {
  if (configRead.inputs.uri)
    configRead.source = await ofetch<any>(configRead.inputs.uri)
  if (configRead.inputs.http) {
    const { url, ...options } = configRead.inputs.http as any
    configRead.source = await ofetch<any>(url || configRead.inputs.uri || '', options)
  }
  if (configRead.inputs.json)
    configRead.source = await readJsonSource(configRead.inputs.json)

  if (!configRead.source)
    throw new Error('No source found, please check your input config.')

  // Transform source based on parser configuration
  const parser = configRead.config.parser || 'swagger'
  if (parser === 'wpapi') {
    // Convert WordPress REST API schema to Swagger 2.0
    configRead.source = wpapiToSwagger2(configRead.source as any)
  }
  // For 'swagger' parser, source is already in Swagger/OpenAPI format, no transformation needed

  if (!configRead.source.schemes?.length) {
    const schemes: string[] = []
    if (configRead.inputs.uri?.startsWith('https://'))
      schemes.push('https', 'http')
    if (configRead.inputs.uri?.startsWith('http://'))
      schemes.push('http')
    configRead.source.schemes = schemes
  }

  return configRead
}

function readJsonSource(json: string | Record<string, any>) {
  if (!json)
    return
  if (typeof json === 'object')
    return json
  else
    return import(json).then(mod => mod.default)
}
