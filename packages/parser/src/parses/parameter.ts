import type { StatementField } from '@genapi/shared'
import type { Parameter } from 'openapi-specification-types'
import { spliceEnumDescription, varFiled } from '../utils'
import { parseSchemaType } from './schema'

/**
 * Converts a single OpenAPI parameter into a StatementField (name, type, required, description).
 *
 * @param parameter - OpenAPI parameter (query, path, header, body, etc.)
 * @returns StatementField for codegen (supports enum description for query arrays)
 * @example
 * ```ts
 * const field = parseParameterFiled({ name: 'id', in: 'path', type: 'string', required: true })
 * // { name: 'id', type: 'string', required: true }
 * ```
 */
export function parseParameterFiled(parameter: Parameter) {
  const field: StatementField = {
    description: parameter.description ?? '',
    required: parameter.required,
    name: varFiled(parameter.name),
    type: '',
  }

  const descParts: string[] = []
  if (field.description)
    descParts.push(`@description ${field.description}`)
  if (parameter.example !== undefined)
    descParts.push(`@example ${JSON.stringify(parameter.example)}`)
  if (parameter.format)
    descParts.push(`@format ${parameter.format}`)
  if (parameter.default !== undefined)
    descParts.push(`@default ${JSON.stringify(parameter.default)}`)
  field.description = descParts.length > 0 ? descParts : undefined

  if (parameter.in === 'query' && parameter.type === 'array') {
    const rawEnum = parameter.items?.enum
    const enums = Array.isArray(rawEnum) ? rawEnum.filter((e): e is string => typeof e === 'string') : []
    const enumsDesc = spliceEnumDescription(parameter.name, enums)
    if (enumsDesc) {
      const current = Array.isArray(field.description) ? field.description : []
      field.description = [...current, enumsDesc]
    }
  }

  if (['formData', 'body', 'header', 'path', 'query', 'cookie', 'querystring'].includes(parameter.in))
    field.type = parseSchemaType(parameter as Parameters<typeof parseSchemaType>[0])

  if (!field.description)
    delete field.description
  return field
}
