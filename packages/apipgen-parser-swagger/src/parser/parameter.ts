import type { StatementField } from 'apipgen/typings'
import type { Parameter } from 'openapi-specification-types'
import { spliceEnumDescription, spliceEnumType } from '../utils'
import { parseSchemaType } from './schema'

/**
 * parse parameter to filed
 * @param parameter
 * @returns
 */
export function parseParameterFiled(parameter: Parameter) {
  const field: StatementField = {
    name: parameter.name,
    type: '',
    required: parameter.required,
    description: parameter.description ?? '',
  }

  if (field.description)
    field.description = `@description ${field.description}`

  if (['formData', 'body', 'header', 'path'].includes(parameter.in))
    field.type = parseSchemaType(parameter)
  if (parameter.in === 'query') {
    if (parameter.type !== 'array') {
      field.type = parseSchemaType(parameter)
    }
    else {
      const enums = spliceEnumDescription(parameter.name, parameter.items?.enum)
      field.description = [field.description || '', enums].filter(Boolean)
      field.type = `string | ${spliceEnumType(parameter.items?.enum)}`
    }
  }

  return field
}
