import type { ApiPipeline, StatementField } from '@genapi/shared'
import type { Method, Parameter } from 'openapi-specification-types'

export interface InSchemas {
  path?: string
  body?: string
  query?: string
  header?: string
  formData?: string
}

export function fillParameters(options: Method, parameters: Parameter[]) {
  parameters = parameters.filter((item) => {
    return !options.parameters?.some(v => v.name === item.name)
  })
  parameters = [...parameters, ...(options.parameters || [])]
  return parameters
}

export function toUndefField(inType: Parameter['in'], schemas: InSchemas = {}) {
  const toSchemas = {
    path: schemas.path || 'paths',
    body: schemas.body || 'body',
    query: schemas.query || 'query',
    header: schemas.header || 'headers',
    formData: schemas.formData || schemas.body || 'body',
  }
  return toSchemas[inType]
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
