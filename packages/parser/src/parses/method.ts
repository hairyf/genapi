import type { StatementField, StatementInterface } from '@genapi/shared'
import type { Parameter } from 'openapi-specification-types'
import type { PathMethod } from '../traverse'
import type { InSchemas, LiteralField } from '../utils'
import { inject, provide } from '@genapi/shared'
import { camelCase } from '@hairy/utils'
import { transformOperation } from '../transform'
import { isRequiredParameter, signAnyInter, toUndefField, varName } from '../utils'
import { parseParameterFiled } from './parameter'
import { parseSchemaType } from './schema'

export type { InSchemas }

/**
 * parse params to function options
 * @param {PathMethod} [pathMethod] { method, parameters, path }
 * @param {InSchemas} [schemas]
 */
export function parseMethodParameters({ method, parameters, path }: PathMethod, schemas?: InSchemas) {
  const { config: userConfig } = inject()
  const requestConfigs: Record<string, StatementField[]> = {
    body: [],
    formData: [],
    path: [],
    query: [],
    header: [],
    cookie: [],
    querystring: [],
  }

  const config = {
    options: [] as LiteralField[],
    parameters: [] as StatementField[],
    interfaces: [] as StatementInterface[],
  }

  for (const parameter of parameters) {
    const key = parameter.in
    if (key in requestConfigs)
      requestConfigs[key].push(parseParameterFiled(parameter))
  }

  for (const [inType, properties] of Object.entries(requestConfigs)) {
    if (properties.length === 0)
      continue

    const name = toUndefField(inType as Parameter['in'], schemas)

    if (inType !== 'path')
      config.options.push(name)

    if (inType === 'header')
      signAnyInter(properties)

    if (inType === 'formData') {
      increaseFromDataParameter(name)
      continue
    }
    if (inType === 'body') {
      increaseBodyParameter(name, properties)
      continue
    }

    if (['header', 'path', 'query', 'cookie', 'querystring'].includes(inType)) {
      const typeName = varName([method, path, inType])
      config.interfaces.push({ name: typeName, properties, export: true })
      const required = inType === 'path' || isRequiredParameter(properties) || userConfig?.parametersRequired
      config.parameters.push({ name, type: typeName, required })
    }
  }

  function increaseBodyParameter(name: string, properties: StatementField[]) {
    config.parameters.push({
      required: properties[0].required || userConfig?.parametersRequired,
      type: properties[0].type,
      name,
    })
  }
  function increaseFromDataParameter(name: string) {
    config.parameters.push({
      type: 'FormData',
      required: true,
      name,
    })
  }

  // fix: for path required parameters, move to the end
  config.parameters.sort(a => (a.required ? -1 : 1))

  provide(`${method}/${path}`, config)
  return config
}

export function parseMethodMetadata({ method, path, responses, options: meta }: PathMethod) {
  const { configRead, interfaces } = inject()
  const metaAny = meta as { consumes?: string[] }
  const comments = [
    meta.summary && `@summary ${meta.summary}`,
    meta.description && `@description ${meta.description}`,
    `@method ${method}`,
    meta.tags?.length ? `@tags ${meta.tags.join(' | ') || '-'}` : undefined,
    metaAny.consumes?.length ? `@consumes ${metaAny.consumes.join('; ') || '-'}` : undefined,
  ].filter((c): c is string => typeof c === 'string')

  let name = camelCase(`${method}/${path}`)

  const url = `${path.replace(/(\{)/g, '${paths.')}`
  function hasContent(r: unknown): r is { content?: Record<string, { schema?: unknown }> } {
    return r != null && typeof r === 'object' && 'content' in r
  }
  const resDefault = responses.default && hasContent(responses.default) ? responses.default : null
  const res200 = responses['200'] && typeof responses['200'] === 'object' ? responses['200'] : null
  const contentDefault = resDefault?.content?.['application/json']
  const content200 = res200 && hasContent(res200) ? res200.content?.['application/json'] : null
  const schemaFromContent = (contentDefault && typeof contentDefault === 'object' && 'schema' in contentDefault ? (contentDefault as { schema: unknown }).schema : null)
    ?? (content200 && typeof content200 === 'object' && 'schema' in content200 ? (content200 as { schema: unknown }).schema : null)
  const schemaFromRes200 = res200 && typeof res200 === 'object' && 'schema' in res200 && !('content' in res200) ? (res200 as { schema: unknown }).schema : null
  const responseSchema = schemaFromContent ?? schemaFromRes200
  let responseType = responseSchema && typeof responseSchema === 'object' ? parseSchemaType(responseSchema as Parameters<typeof parseSchemaType>[0]) : 'void'

  if (configRead.config.responseRequired)
    deepSignRequired(interfaces.find(v => v.name === responseType)?.properties || [])

  function deepSignRequired(properties: StatementField[]) {
    for (const property of properties) {
      property.required = true

      for (const { properties } of interfaces.filter(v => v.name === property.type))
        deepSignRequired(properties || [])
    }
  }

  const config = inject(`${method}/${path}`)
  ;({ name, responseType } = transformOperation({
    configRead,
    name,
    parameters: config?.parameters,
    responseType,
  }))
  return { description: comments, name, url, responseType, body: [] as string[] }
}
