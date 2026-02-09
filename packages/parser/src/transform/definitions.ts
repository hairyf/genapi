import type { ApiPipeline, StatementField, StatementInterface } from '@genapi/shared'
import type { Definitions, Schema } from 'openapi-specification-types'
import { inject } from '@genapi/shared'
import { parseSchemaType } from '../parses'
import { varFiled, varName } from '../utils'

/**
 * Options for definition transform (e.g. target interfaces array).
 */
export interface DefinitionTransformOptions {
  interfaces: StatementInterface[]
}

/**
 * Converts OpenAPI definitions (schemas) to StatementInterface entries and pushes to context interfaces; applies config transform/patch.
 *
 * @param definitions - OpenAPI definitions object (Swagger 2 style)
 * @example
 * ```ts
 * transformDefinitions(spec.definitions)
 * // inject().interfaces now includes User, Order, etc.
 * ```
 */
export function transformDefinitions(definitions: Definitions) {
  const { interfaces, configRead } = inject()
  const config = configRead?.config || {} as ApiPipeline.Config
  const transformDef = config.transform?.definition
  const patchDefinitions = config.patch?.definitions || {}

  for (let [name, definition] of Object.entries(definitions)) {
    const defProperties = definition.properties || {}
    let properties = Object.keys(defProperties)
      .map(name => defToFields(name, defProperties[name])) as StatementField[]
    name = varName(name)

    ;({ name, properties } = applyPatch(transformDef?.(name, properties)))
    ;({ name, properties } = applyPatch(patchDefinitions[name]))

    interfaces.add('type', {
      name,
      export: true,
      properties,
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

    function applyPatch(patch?: ApiPipeline.Definition) {
      if (!patch)
        return { name, properties }
      if (typeof patch === 'string') {
        name = patch
        return { name, properties }
      }
      if (patch.name)
        name = patch.name
      if (patch.type)
        properties = patch.type

      return { name, properties }
    }
  }
}
