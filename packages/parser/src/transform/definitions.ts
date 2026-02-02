import type { StatementInterface } from '@genapi/shared'
import type { Definitions, Schema } from 'openapi-specification-types'
import { inject } from '@genapi/shared'
import { parseSchemaType } from '../parses'
import { varFiled, varName } from '../utils'

export interface DefinitionTransformOptions {
  interfaces: StatementInterface[]
}

export function transformDefinitions(definitions: Definitions) {
  const { interfaces } = inject()

  for (const [name, definition] of Object.entries(definitions)) {
    const { properties = {} } = definition

    interfaces.push({
      export: true,
      name: varName(name),
      properties: Object.keys(properties).map(name => defToFields(name, properties[name])),
    })

    function defToFields(name: string, propertie: Schema) {
      const required = Array.isArray(definition?.required) ? definition.required.includes(name) : undefined
      const description = propertie.description ? `@description ${propertie.description}` : undefined
      return {
        name: varFiled(name),
        type: parseSchemaType(propertie),
        description,
        required: required ?? (typeof propertie.required === 'boolean' ? propertie.required : undefined),
      }
    }
  }
}
