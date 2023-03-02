import type { StatementField } from 'apipgen'
import type { Method, Parameter } from 'openapi-specification-types'

export function fillParameters(options: Method, parameters: Parameter[]) {
  parameters = parameters.filter((item) => {
    return !options.parameters?.some(v => v.name === item.name)
  })
  parameters = [...parameters, ...(options.parameters || [])]
  return parameters
}

export function toUndefField(inType: Parameter['in']) {
  const schemas = {
    path: 'paths',
    body: 'data',
    query: 'params',
    header: 'headers',
    formData: 'data',
  }
  return schemas[inType]
}

/**
 * 对类型进行 any 签名
 * @param field
 */
export function signAnyInter(fields: StatementField[]) {
  fields.push({ name: '[key: string]', required: true, type: 'any' })
}
