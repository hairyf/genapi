import type { StatementField } from 'apipgen'
import type { Parameter } from 'openapi-specification-types'
import { spliceEnumDescription } from '../format'
import { getPropertieType } from './propertie'

export function getParameterFields(parameter: Parameter) {
  const field: StatementField = {
    name: parameter.name,
    type: '',
    required: parameter.required,
    description: parameter.description ?? '',
  }

  if (field.description)
    field.description = `@description ${field.description}`

  if (['formData', 'body', 'header', 'path'].includes(parameter.in))
    field.type = getPropertieType(parameter)
  if (parameter.in === 'query') {
    if (parameter.type !== 'array') {
      field.type = getPropertieType(parameter)
    }
    else {
      const enums = spliceEnumDescription(parameter.name, parameter.items?.enum)
      field.description = [field.description || '', enums].filter(Boolean)
    }
  }

  return field
}
