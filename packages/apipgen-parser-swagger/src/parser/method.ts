import type { StatementField, StatementInterface } from 'apipgen'
import type { Parameter } from 'openapi-specification-types'
import camelCase from 'lodash/camelCase'
import type { PathMethod } from '../traverse'
import type { InSchemas, LiteralField } from '../utils'
import { fillParameters, isRequiredParameter, signAnyInter, toUndefField, varName } from '../utils'
import { parseParameterFiled } from './parameter'
import { parseSchemaType } from './schema'

export type { InSchemas }

/**
 * parse params to function options
 * @param param
 * @returns
 */
export function parseMethodParameters({ method, parameters, options, path }: PathMethod, schemas?: InSchemas) {
  parameters = fillParameters(options, parameters)

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
      name,
      type: properties[0].type,
      required: properties[0].required,
    })
  }
  function increaseFromDataParameter(name: string) {
    config.parameters.push({
      name,
      type: 'FormData',
      required: true,
    })
  }

  return config
}

export function parseMethodMetadata({ method, options: meta, path }: PathMethod) {
  const comments = [
    meta.summary && `@summary ${meta.summary}`,
    meta.description && `@description ${meta.description}`,
    `@method ${method}`,
    meta.tags && `@tags ${meta.tags.join(' | ') || '-'}`,
    meta.consumes && `@consumes ${meta.consumes.join('; ') || '-'}`,
  ]

  const name = camelCase(`${method}/${path}`)
  const url = `${path.replace(/({)/g, '${paths.')}`
  const responseType = meta.responses['200'] ? parseSchemaType(meta.responses['200']) : 'void'

  return { description: comments.filter(Boolean), name, url, responseType, body: [] as string[] }
}
