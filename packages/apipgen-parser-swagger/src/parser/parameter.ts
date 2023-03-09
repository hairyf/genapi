import type { StatementField } from 'apipgen/typings'
import type { Parameter } from 'openapi-specification-types'
import { spliceEnumDescription, varFiled } from '../utils'
import { parseSchemaType } from './schema'

/**
 * parse parameter to filed
 * @param parameter
 * @returns
 */
export function parseParameterFiled(parameter: Parameter) {
  const field: StatementField = {
    name: varFiled(parameter.name),
    type: '',
    required: parameter.required,
    description: parameter.description ?? '',
  }

  if (field.description)
    field.description = `@description ${field.description}`

  if (parameter.in === 'query' && parameter.type === 'array') {
    const enums = spliceEnumDescription(parameter.name, parameter.items?.enum)
    field.description = [field.description || '', enums].filter(Boolean)
  }

  if (['formData', 'body', 'header', 'path', 'query'].includes(parameter.in))
    field.type = parseSchemaType(parameter)

  if (!field.description)
    delete field.description
  return field
}
