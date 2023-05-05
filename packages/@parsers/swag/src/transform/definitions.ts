import type { StatementInterface } from '@genapi/config'
import type { Definitions, Schema } from 'openapi-specification-types'
import { parseSchemaType } from '../parser'
import { varFiled, varName } from '../utils'

export interface DefinitionTransformOptions {
  interfaces: StatementInterface[]
}

export function transformDefinitions(definitions: Definitions, { interfaces }: DefinitionTransformOptions) {
  for (const [name, definition] of Object.entries(definitions)) {
    const { properties = {} } = definition

    interfaces.push({
      export: true,
      name: varName(name),
      properties: Object.keys(properties).map(name => defToFields(name, properties[name])),
    })

    function defToFields(name: string, propertie: Schema) {
      propertie.required = definition?.required?.some(v => v === name)
      if (propertie.description)
        propertie.description = `@description ${propertie.description}`

      return {
        name: varFiled(name),
        type: parseSchemaType(propertie),
        description: propertie.description,
        required: propertie.required,
      }
    }
  }
}
