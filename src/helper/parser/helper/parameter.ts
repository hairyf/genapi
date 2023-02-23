import type { StatementFiled } from '../../typings/parser'
import { spliceEnumDescription, spliceEnumType } from '../helper/util'
import { helperPropertie } from '../helper/propertie'
import type * as OpenAPITypes from 'openapi-specification-types'

export function helperParameter(parameter: OpenAPITypes.Parameter): StatementFiled {
  const filed: StatementFiled = {
    name: parameter.name,
    type: '',
    required: parameter.required,
    description: parameter.description ?? '',
  }

  if (filed.description)
    filed.description = `@description ${filed.description}`

  if (parameter.in === 'formData')
    filed.type = helperPropertie(parameter)
  if (parameter.in === 'body')
    filed.type = helperPropertie(parameter)
  if (parameter.in === 'header')
    filed.type = helperPropertie(parameter)
  if (parameter.in === 'path')
    filed.type = helperPropertie(parameter)
  if (parameter.in === 'query') {
    if (parameter.type !== 'array') {
      filed.type = helperPropertie(parameter)
    }
    else {
      const enumDescription = spliceEnumDescription(parameter.name, parameter.items?.enum)
      filed.description = [filed.description, enumDescription].filter(Boolean) as string[]
      filed.type = `string | ${spliceEnumType(parameter.items?.enum)}[]`
    }
  }

  return filed
}
