import type { ApiPipeline, StatementField, StatementInterface } from 'apipgen'
import type { Definitions, Schema } from 'openapi-specification-types'
import { parseSchemaType } from '../parser'
import type { LiteralField } from '../utils'
import { varName } from '../utils'

export interface ParameterTransformOptions {
  configRead: ApiPipeline.ConfigRead
  interfaces: StatementInterface[]
  description: string[]
  responseType: string
  syntax: 'typescript' | 'ecmascript'
}
export interface DefinitionTransformOptions {
  interfaces: StatementInterface[]
}
export interface QueryUrlTransformOptions {
  body?: string[]
  key?: string
  url?: string
  options: LiteralField[]
}

export interface BodyJsonTransformOptions {
  options: LiteralField[]
  parameters: StatementField[]
}

export interface BaseUrlTransformOptions {
  baseURL?: string
}

export function transformParameters(parameters: StatementField[], options: ParameterTransformOptions) {
  const { configRead, syntax, interfaces, description, responseType } = options
  const typeOutput = configRead.outputs.find(v => v.type === 'typings')!
  const isGenerateType = configRead.config.output?.type !== false
  const TypeNamespace = syntax === 'ecmascript' ? `import('${typeOutput?.import}')` : 'Types'
  const spaceResponseType = `${TypeNamespace}.Response<${spliceTypeSpace(responseType)}>`
  for (const parameter of parameters || []) {
    if (!parameter.type)
      continue
    parameter.type = spliceTypeSpace(parameter.type)

    if (syntax !== 'ecmascript')
      continue
    if (isGenerateType)
      description.push(`@param {${parameter.type}${parameter.required ? '' : '='}} ${parameter.name}`)
    parameter.type = undefined
    parameter.required = true
  }

  if (isGenerateType && syntax === 'ecmascript')
    description.push(`@return {${spaceResponseType}}`)

  function spliceTypeSpace(name: string) {
    const someType = interfaces.map(v => v.name).includes(name.replace('[]', ''))
    if (isGenerateType && someType)
      return `${TypeNamespace}.${name}`
    return name
  }

  return { spaceResponseType }
}

export function transformDefinitions(definitions: Definitions, { interfaces }: DefinitionTransformOptions) {
  for (const [name, definition] of Object.entries(definitions)) {
    const { properties = {} } = definition

    interfaces.push({
      export: true,
      name: varName(name),
      properties: Object.keys(properties).map(name => defToFields(name, properties[name])),
    })

    function defToFields(name: string, propertie: Schema) {
      propertie.required = definition?.required?.some(v => v === name)
      if (propertie.description)
        propertie.description = `@description ${propertie.description}`
      return {
        name,
        type: parseSchemaType(propertie),
        description: propertie.description,
        required: propertie.required,
      }
    }
  }
}

export function transformBodyStringify(name: string, { options, parameters }: BodyJsonTransformOptions) {
  if (options.includes(name) && !parameters.find(v => v.type === 'FormData'))
    options.splice(options.findIndex(v => v === name), 1, [name, 'JSON.stringify(body || {})'])
}

export function transformQueryParams(name: string, { body, options, key, url }: QueryUrlTransformOptions) {
  if (key) {
    const searchParams = [key, `new URLSearchParams(Object.entries(${name}))`] as LiteralField
    if (options.includes(name))
      options.splice(options.findIndex(v => v === name), 1, searchParams)
  }
  else if (options.includes(name)) {
    options.splice(options.findIndex(v => v === name), 1)
    body?.push(`const _${name}_ = \`?\${new URLSearchParams(Object.entries(${name})).toString()}\``)
    url += `\${_${name}_}`
  }
  return url || ''
}

export function transformUrlSyntax(url: string, { baseURL }: BaseUrlTransformOptions = {}) {
  if (baseURL)
    url = `\${baseURL}${url}`
  return url.includes('$') ? `\`${url}\`` : `'${url}'`
}
