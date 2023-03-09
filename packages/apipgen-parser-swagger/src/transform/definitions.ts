import type { StatementInterface } from 'apipgen/typings'
import type { Definitions, Schema } from 'openapi-specification-types'
import { parseSchemaType } from '../parser'
import { varName } from '../utils'

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
      if (/[^A-Za-z]/g.test(name))
        name = `['${name}']`

      return {
        name,
        type: parseSchemaType(propertie),
        description: propertie.description,
        required: propertie.required,
      }
    }
  }
}
