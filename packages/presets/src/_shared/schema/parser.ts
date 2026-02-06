import type { Parameter } from 'openapi-specification-types'
import {
  createParser,
  parseSchemaType,
} from '@genapi/parser'

export interface SchemaRoute {
  path: string
  method: string
  queryType?: string
  bodyType?: string
  headersType?: string
  responseType: string
}

function hasContent(r: unknown): r is { content?: Record<string, { schema?: unknown }> } {
  return r != null && typeof r === 'object' && 'content' in r
}

function getResponseType(responses: any): string {
  const resDefault = responses.default && hasContent(responses.default) ? responses.default : null
  const res200 = responses['200'] && typeof responses['200'] === 'object' ? responses['200'] : null
  const contentDefault = resDefault?.content?.['application/json']
  const content200 = res200 && hasContent(res200) ? res200.content?.['application/json'] : null
  const schemaFromContent = (contentDefault && typeof contentDefault === 'object' && 'schema' in contentDefault ? (contentDefault as { schema: unknown }).schema : null)
    ?? (content200 && typeof content200 === 'object' && 'schema' in content200 ? (content200 as { schema: unknown }).schema : null)
  const schemaFromRes200 = res200 && typeof res200 === 'object' && 'schema' in res200 && !('content' in res200) ? (res200 as { schema: unknown }).schema : null
  const responseSchema = schemaFromContent ?? schemaFromRes200
  return responseSchema && typeof responseSchema === 'object' ? parseSchemaType(responseSchema as Parameters<typeof parseSchemaType>[0]) : 'void'
}

export const schemaParser = createParser((config, { configRead }) => {
  const { path, method, responses, parameters } = config

  const queryParams: Parameter[] = parameters.filter(p => p.in === 'query')
  const headerParams: Parameter[] = parameters.filter(p => p.in === 'header')
  const bodyParams: Parameter[] = parameters.filter(p => p.in === 'body')

  // Parse response type
  const responseType = getResponseType(responses)

  // Parse query parameters
  let queryType: string | undefined
  if (queryParams.length > 0) {
    const queryFields = queryParams.map((p) => {
      const type = parseSchemaType(p as Parameters<typeof parseSchemaType>[0])
      const optional = p.required ? '' : '?'
      return `${p.name}${optional}: ${type}`
    })
    queryType = `{ ${queryFields.join('; ')} }`
  }

  // Parse body
  let bodyType: string | undefined
  if (bodyParams.length > 0) {
    bodyType = parseSchemaType(bodyParams[0] as Parameters<typeof parseSchemaType>[0])
  }

  // Parse headers
  let headersType: string | undefined
  if (headerParams.length > 0) {
    const headerFields = headerParams.map((p) => {
      const type = parseSchemaType(p as Parameters<typeof parseSchemaType>[0])
      const optional = p.required ? '' : '?'
      return `'${p.name}'${optional}: ${type}`
    })
    headersType = `{ ${headerFields.join('; ')} }`
  }

  configRead.__schemaRoutes = configRead.__schemaRoutes || []
  configRead.__schemaRoutes.push({
    path,
    method: method.toUpperCase(),
    queryType,
    bodyType,
    headersType,
    responseType,
  })
})
