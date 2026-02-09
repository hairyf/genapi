import type { ApiPipeline } from '@genapi/shared'
import { wpapiToSwagger2 } from '@genapi/transform'
import { parseYAML } from 'confbox'
import { ofetch } from 'ofetch'

function isYamlUrl(url: string) {
  try {
    const pathname = new URL(url).pathname
    return pathname.endsWith('.yaml') || pathname.endsWith('.yml')
  }
  catch {
    return false
  }
}

async function fetchSource(url: string, options?: Record<string, any>) {
  if (isYamlUrl(url)) {
    const text = await ofetch(url, { ...options, responseType: 'text' })
    return parseYAML(text as string) as Record<string, any>
  }
  if (options && Object.keys(options).length > 0)
    return await ofetch<any>(url, options)
  return await ofetch<any>(url)
}

/**
 * Fetches source: resolves uri/http/json from configRead.inputs and sets configRead.source.
 * Transforms the source based on parser configuration (wpapi -> swagger2, swagger -> unchanged).
 * Supports YAML source URLs (e.g. .yaml / .yml); uses confbox for parsing (same as undocs).
 *
 * @param configRead - ConfigRead with inputs (uri, http, or json)
 * @returns Same configRead with source set and transformed if needed
 * @group Pipeline
 */
export async function original(configRead: ApiPipeline.ConfigRead) {
  if (configRead.inputs.uri)
    configRead.source = await fetchSource(configRead.inputs.uri)
  if (configRead.inputs.http) {
    const { url, ...options } = configRead.inputs.http as any
    configRead.source = await fetchSource(url || configRead.inputs.uri || '', options)
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
    const effectiveUrl = (configRead.inputs.http as any)?.url || configRead.inputs.uri || ''
    const schemes: string[] = []
    if (effectiveUrl.startsWith('https://'))
      schemes.push('https', 'http')
    if (effectiveUrl.startsWith('http://'))
      schemes.push('http')
    // 仅当从 URI 推断出 schemes 时才写入，避免给内联 JSON 等无 URI 的 source 注入空 schemes
    if (schemes.length > 0)
      configRead.source.schemes = schemes
  }

  return configRead
}

function readJsonSource(json: string | Record<string, any>): Promise<Record<string, any> | undefined> {
  if (!json)
    return Promise.resolve(undefined)
  if (typeof json === 'object')
    return Promise.resolve(json)
  const trimmed = String(json).trim()
  // 内联 JSON 字符串（例如 API 传入的 spec 内容）与文件路径区分：以 { 或 [ 开头则解析为 JSON
  if (trimmed.startsWith('{') || trimmed.startsWith('['))
    return Promise.resolve(JSON.parse(json as string) as Record<string, any>)
  return import(json as string).then(mod => mod.default)
}
