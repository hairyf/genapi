import type * as OpenAPITypes from 'openapi-specification-types'
import isArray from 'lodash/isArray'
import isEmpty from 'lodash/isEmpty'

import { useRefMap, varName } from '../helper/util'
import extra from 'ts-factory-extra'

export function helperPropertie(propertie: OpenAPITypes.Schema): string {
  if (propertie.originalRef)
    return varName(propertie.originalRef)

  if (propertie.$ref)
    return varName(useRefMap(propertie.$ref))

  if (propertie.schema)
    return helperPropertie(propertie.schema)

  if (propertie.additionalProperties)
    return `Record<string, ${helperPropertie(propertie.additionalProperties)}>`

  if (!propertie.type)
    return 'any'

  if (propertie.type === 'object') {
    if (!propertie.properties || isEmpty(propertie.properties))
      return 'Record<string, any>'

    const fields = Object.keys(propertie.properties).map((name) => {
      const item = propertie.properties![name]
      const type = helperPropertie(item)
      return {
        name,
        type,
        required: !!item.required,
        description: item.description,
      }
    })
    const nodes = extra.createTypeAliasBlock(fields)
    const code = extra.astNodeToCode(nodes)
    return code.replace(/ \? {2}: /g, '?: ')
  }
  if (propertie.type === 'array')
    return `${helperPropertie(propertie.items!)}[]`

  if (propertie.type === 'boolean')
    return propertie.type

  if (propertie.type === 'string')
    return propertie.type

  if (isArray(propertie.type))
    return propertie.type.map(type => helperPropertie({ type })).join(' | ')

  if (['integer', 'long', 'float', 'byte', 'TypesLong'].includes(propertie.type))
    return 'number'

  if (['byte', 'binary', 'date', 'dateTime', 'password', 'TypesString'].includes(propertie.type))
    return 'string'

  return 'any'
}
