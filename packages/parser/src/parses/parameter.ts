import type { StatementField } from '@genapi/shared'
import type { Parameter } from 'openapi-specification-types'
import { spliceEnumDescription, varFiled } from '../utils'
import { parseSchemaType } from './schema'

/**
 * parse parameter to filed
 * @param parameter
 */
export function parseParameterFiled(parameter: Parameter) {
  const field: StatementField = {
    description: parameter.description ?? '',
    required: parameter.required,
    name: varFiled(parameter.name),
    type: '',
  }

  if (field.description)
    field.description = `@description ${field.description}`

  if (parameter.in === 'query' && parameter.type === 'array') {
    const rawEnum = parameter.items?.enum
    const enums = Array.isArray(rawEnum) ? rawEnum.filter((e): e is string => typeof e === 'string') : []
    const enumsDesc = spliceEnumDescription(parameter.name, enums)
    field.description = [field.description || '', enumsDesc].filter(Boolean)
  }

  if (['formData', 'body', 'header', 'path', 'query', 'cookie', 'querystring'].includes(parameter.in))
    field.type = parseSchemaType(parameter as Parameters<typeof parseSchemaType>[0])

  if (!field.description)
    delete field.description
  return field
}
