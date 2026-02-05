import type { ApiPipeline, StatementInterface } from '@genapi/shared'
import type { Definitions, Schema } from 'openapi-specification-types'
import { inject } from '@genapi/shared'
import { parseSchemaType } from '../parses'
import { varFiled, varName } from '../utils'

export interface DefinitionTransformOptions {
  interfaces: StatementInterface[]
}

export function transformDefinitions(definitions: Definitions) {
  const { interfaces, configRead } = inject()
  const config = (configRead?.config || {}) as ApiPipeline.Config
  const transformDef = config.transform?.definition
  const patchDefinitions = config.patch?.definitions || {}

  for (const [name, definition] of Object.entries(definitions)) {
    const { properties = {} } = definition

    const interfaceName = varName(name)

    interfaces.push({
      export: true,
      name: interfaceName,
      properties: Object.keys(properties).map(name => defToFields(name, properties[name])),
    })

    // Build a structural type string for this definition so `transform.definition`
    // and `patch.definitions` can operate on it.
    const baseType = buildDefinitionType(interfaceName, properties)
    applyDefinitionTransformsAndPatches({
      baseName: interfaceName,
      baseType,
      configRead,
      transformDef,
      patchDefinitions,
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

function buildDefinitionType(interfaceName: string, properties: Definitions[string]['properties'] = {}) {
  const entries = Object.entries(properties)
  if (entries.length === 0)
    return 'any'

  const fields = entries.map(([propName, schema]) => {
    const type = parseSchemaType(schema as Schema)
    return `${varFiled(propName)}: ${type}`
  })

  return `{ ${fields.join(', ')} }`
}

interface DefinitionPatchContext {
  baseName: string
  baseType: string
  configRead: ApiPipeline.ConfigRead
  transformDef?: (name: string, type: string) => ApiPipeline.Definition
  patchDefinitions: Record<string, ApiPipeline.Definition>
}

/**
 * Applies `config.transform.definition` (global) and `config.patch.definitions` (static)
 * to a single Swagger/OpenAPI definition.
 *
 * Semantics:
 * - Rename only: `'UserDto': 'User'` → `export type User = UserDto`
 * - Rename + override type:
 *   `'SessionDto': { name: 'Session', type: '{ name: string }' }`
 *   → `export type Session = { name: string }`
 *
 * The original interface (e.g. `UserDto`) is preserved so existing references
 * from schemas remain valid; patches add friendly alias types on top.
 */
function applyDefinitionTransformsAndPatches(ctx: DefinitionPatchContext) {
  const {
    baseName,
    baseType,
    configRead,
    transformDef,
    patchDefinitions,
  } = ctx

  let aliasName = baseName
  let aliasType = baseType

  function applyPatch(patch?: ApiPipeline.Definition) {
    if (!patch)
      return

    if (typeof patch === 'string') {
      aliasName = patch
      return
    }

    if (patch.name)
      aliasName = patch.name
    if (patch.type)
      aliasType = patch.type
  }

  // Global transform first.
  if (transformDef) {
    const patch = transformDef(baseName, baseType)
    applyPatch(patch)
  }

  // Then static patch; allow matching by original or transformed name.
  const staticPatch = patchDefinitions[baseName] ?? patchDefinitions[aliasName]
  applyPatch(staticPatch)

  const hasNameChange = aliasName !== baseName
  const hasTypeChange = aliasType !== baseType

  if (!hasNameChange && !hasTypeChange)
    return

  const aliasValue = hasTypeChange ? aliasType : baseName

  configRead.graphs.typings = configRead.graphs.typings || []
  configRead.graphs.typings.push({
    export: true,
    name: aliasName,
    value: aliasValue,
  })
}
