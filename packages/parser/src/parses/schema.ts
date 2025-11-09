import type { StatementField } from '@genapi/shared/dist/index.mjs'

import type { Properties, Schema } from 'openapi-specification-types'
import { inject } from '@genapi/shared'
import { isArray, uniq } from '@hairy/utils'
import { spliceEnumType, useRefMap, varName } from '../utils'

/**
 * parse schema to type
 * @param propertie
 */
export function parseSchemaType(propertie: Schema): string {
  const { interfaces = [] } = inject()

  if (!propertie)
    return 'any'
  if (propertie.originalRef)
    return varName(propertie.originalRef)

  if (propertie.$ref)
    return varName(useRefMap(propertie.$ref))

  // Handle allOf: merge multiple schemas, typically used for generic response types
  if (propertie.allOf) {
    const fields: Record<string, StatementField> = {}
    let base = 'Anonymous'
    let isMerge = false
    // Merge all schema attributes in allOf
    for (const schema of propertie.allOf) {
      // Handling $ref references: merging properties of reference interfaces
      assignBaseProperties(schema)
      // Processing direct attributes of schema
      assignProperties(schema.properties)
    }

    assignProperties(propertie.properties)

    function assignBaseProperties(schema: Schema) {
      if (!schema.$ref)
        return
      const type = parseSchemaType(schema)
      if (schema.$ref)
        base = type
      for (const property of interfaces.find(v => v.name === type)?.properties || [])
        fields[property.name] = property
    }
    function assignProperties(properties?: Properties) {
      for (const [field, item] of Object.entries(properties || {})) {
        const type = parseSchemaType(item)

        if (item.$ref || item.items?.$ref)
          base = type.replace('[]', '')

        if (!isMerge)
          isMerge = true
        fields[field] = {
          type,
          required: item.required ?? true,
          description: item.description,
          name: field,
        }
      }
    }

    // generate a unique interface name
    let name = isMerge ? `AllOf${base}` : base

    if (isMerge) {
      let counter = 1
      while (interfaces.some(v => v.name === name)) {
        name = `AllOf${base}${counter++}`
      }
    }
    if (!interfaces.some(v => v.name === name))
      interfaces.push({ name, properties: Object.values(fields), export: true })
    return name
  }

  if (propertie.schema)
    return parseSchemaType(propertie.schema)

  // TODO: handle additionalProperties
  if (propertie.additionalProperties)
    return `Record<string, ${parseSchemaType(propertie.additionalProperties)}>`
  if (propertie.type === 'object') {
    const fields: Record<string, StatementField> = {}
    for (const [field, item] of Object.entries(propertie.properties || {})) {
      fields[field] = {
        type: parseSchemaType(item),
        required: item.required,
        description: item.description,
        name: field,
      }
    }
    if (Object.keys(fields).length !== 0)
      return `{ ${Object.entries(fields).map(([field, item]) => `${field}: ${item.type}`).join(', ')} }`
  }
  if (!propertie.type)
    return 'any'

  if (propertie.type === 'array') {
    if (propertie.items?.enum)
      return ['string', spliceEnumType(propertie.items.enum)].filter(Boolean).join(' | ')

    let itemsType = parseSchemaType(propertie.items!)
    itemsType = itemsType.includes('|') ? `(${itemsType})` : itemsType
    return `${itemsType}[]`
  }

  if (propertie.type === 'boolean')
    return propertie.type

  if (isArray(propertie.type))
    return uniq(propertie.type.map(type => parseSchemaType({ type }))).join(' | ')

  if (['integer', 'long', 'float', 'byte', 'TypesLong', 'number'].includes(propertie.type))
    return 'number'

  if (['byte', 'binary', 'date', 'dateTime', 'password', 'TypesString', 'string'].includes(propertie.type))
    return 'string'

  return 'any'
}
