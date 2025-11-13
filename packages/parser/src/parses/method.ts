/* eslint-disable ts/ban-ts-comment */
import type { StatementField, StatementInterface } from '@genapi/shared'
import type { Parameter } from 'openapi-specification-types'
import type { PathMethod } from '../traverse'
import type { InSchemas, LiteralField } from '../utils'
import { inject } from '@genapi/shared'
import { camelCase } from '@hairy/utils'
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
  const requestConfigs = {
    body: [] as StatementField[],
    formData: [] as StatementField[],
    path: [] as StatementField[],
    query: [] as StatementField[],
    header: [] as StatementField[],
  }

  const config = {
    options: [] as LiteralField[],
    parameters: [] as StatementField[],
    interfaces: [] as StatementInterface[],
  }

  for (const parameter of parameters)
    requestConfigs[parameter.in].push(parseParameterFiled(parameter))

  for (const [inType, properties] of Object.entries(requestConfigs) as [Parameter['in'], StatementField[]][]) {
    if (properties.length === 0)
      continue

    const name = toUndefField(inType, schemas)

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

    if (['header', 'path', 'query'].includes(inType)) {
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

  return config
}

export function parseMethodMetadata({ method, path, responses, options: meta }: PathMethod) {
  const { configRead, interfaces } = inject()
  const comments = [
    meta.summary && `@summary ${meta.summary}`,
    meta.description && `@description ${meta.description}`,
    `@method ${method}`,
    meta.tags && `@tags ${meta.tags.join(' | ') || '-'}`,
    meta.consumes && `@consumes ${meta.consumes.join('; ') || '-'}`,
  ]

  const name = camelCase(`${method}/${path}`)

  const url = `${path.replace(/(\{)/g, '${paths.')}`
  const responseSchema
    // @ts-expect-error
    = responses.default?.content?.['application/json']?.schema
    // @ts-expect-error
      || responses['200']?.content?.['application/json']?.schema
      || responses['200']?.schema
      || responses['200']
  const responseType = responseSchema ? parseSchemaType(responseSchema) : 'void'

  if (configRead.config.responseRequired)
    deepSignRequired(interfaces.find(v => v.name === responseType)?.properties || [])

  function deepSignRequired(properties: StatementField[]) {
    for (const property of properties) {
      property.required = true

      for (const { properties } of interfaces.filter(v => v.name === property.type))
        deepSignRequired(properties || [])
    }
  }

  return { description: comments.filter(Boolean), name, url, responseType, body: [] as string[] }
}
