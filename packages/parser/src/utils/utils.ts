import type { ApiPipeline, StatementField } from '@genapi/shared'
import type { Method, Parameter } from 'openapi-specification-types'

export function isParameter(p: Parameter | { $ref?: string }): p is Parameter {
  return p != null && 'name' in p && 'in' in p
}

export interface InSchemas {
  path?: string
  body?: string
  query?: string
  header?: string
  formData?: string
  cookie?: string
  querystring?: string
}

export function fillParameters(options: Method, parameters: Parameter[]) {
  const opParams = (options.parameters ?? []).filter(isParameter)
  parameters = parameters.filter((item) => {
    return !opParams.some(v => v.name === item.name)
  })
  return [...parameters, ...opParams]
}

const IN_TYPE_TO_SCHEMA: Record<string, string> = {
  path: 'paths',
  body: 'body',
  query: 'query',
  header: 'headers',
  formData: 'body',
  cookie: 'headers',
  querystring: 'query',
}

export function toUndefField(inType: Parameter['in'], schemas: InSchemas = {}) {
  const key = inType as keyof InSchemas
  return schemas[key] ?? IN_TYPE_TO_SCHEMA[inType] ?? 'query'
}

/**
 * 对类型进行 any 签名
 */
export function signAnyInter(fields: StatementField[]) {
  fields.push({ name: '[key: string]', required: true, type: 'any' })
}

export function replaceMainext(output?: ApiPipeline.PreOutput['output'], ext: 'js' | 'ts' = 'js') {
  const from = ext === 'js' ? 'ts' : 'js'
  const to = ext === 'js' ? ext : 'ts'
  if (typeof output === 'string')
    return output.replace(from, to)
  return output?.main?.replace(from, to)
}
