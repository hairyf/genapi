import type { Schema } from 'openapi-specification-types'
import isArray from 'lodash/isArray'
import { useRefMap, varName } from '../format'

export function getPropertieType(propertie: Schema): string {
  if (propertie.originalRef)
    return varName(propertie.originalRef)

  if (propertie.$ref)
    return varName(useRefMap(propertie.$ref))

  if (propertie.schema)
    return getPropertieType(propertie.schema)

  if (propertie.additionalProperties)
    return `Record<string, ${getPropertieType(propertie.additionalProperties)}>`

  if (!propertie.type)
    return 'any'

  if (propertie.type === 'array')
    return `${getPropertieType(propertie.items!)}[]`

  if (propertie.type === 'boolean')
    return propertie.type

  if (isArray(propertie.type))
    return propertie.type.map(type => getPropertieType({ type })).join(' | ')

  if (['integer', 'long', 'float', 'byte', 'TypesLong'].includes(propertie.type))
    return 'number'

  if (['byte', 'binary', 'date', 'dateTime', 'password', 'TypesString', 'string'].includes(propertie.type))
    return 'string'

  return 'any'
}
