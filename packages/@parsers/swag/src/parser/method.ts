import type { StatementField, StatementInterface } from '@genapi/config'
import type { Parameter } from 'openapi-specification-types'
import camelCase from 'lodash/camelCase'
import type { PathMethod } from '../traverse'
import type { InSchemas, LiteralField } from '../utils'
import { isRequiredParameter, signAnyInter, toUndefField, varName } from '../utils'
import { parseParameterFiled } from './parameter'
import { parseSchemaType } from './schema'

export type { InSchemas }

/**
 * parse params to function options
 * @param param
 * @returns
 */
export function parseMethodParameters({ method, parameters, path }: PathMethod, schemas?: InSchemas) {
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
      config.parameters.push({ name, type: typeName, required: isRequiredParameter(properties) })
    }
  }

  function increaseBodyParameter(name: string, properties: StatementField[]) {
    config.parameters.push({
      required: properties[0].required,
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

  return config
}

export function parseMethodMetadata({ method, path, responses, options: meta }: PathMethod) {
  const comments = [
    meta.summary && `@summary ${meta.summary}`,
    meta.description && `@description ${meta.description}`,
    `@method ${method}`,
    meta.tags && `@tags ${meta.tags.join(' | ') || '-'}`,
    meta.consumes && `@consumes ${meta.consumes.join('; ') || '-'}`,
  ]

  const name = camelCase(`${method}/${path}`)
  const url = `${path.replace(/({)/g, '${paths.')}`
  const responseSchema
  // @ts-expect-error
  = responses.default?.content?.['application/json']?.schema
  // @ts-expect-error
  || responses['200']?.content?.['application/json']?.schema
  || responses['200']
  const responseType = responseSchema ? parseSchemaType(responseSchema) : 'void'

  return { description: comments.filter(Boolean), name, url, responseType, body: [] as string[] }
}
