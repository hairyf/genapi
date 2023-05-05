import type { StatementField } from '@genapi/config'
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
 * @param field
 */
export function signAnyInter(fields: StatementField[]) {
  fields.push({ name: '[key: string]', required: true, type: 'any' })
}
