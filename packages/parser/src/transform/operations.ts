import type { ApiPipeline, StatementField } from '@genapi/shared'

export interface OperationTransformOptions {
  /**
   * Current pipeline config + graphs.
   */
  configRead: ApiPipeline.ConfigRead
  /**
   * Generated operation name.
   */
  name: string
  /**
   * Generated parameters (will be mutated in place if overridden).
   */
  parameters: StatementField[]
  /**
   * Inferred response type for this operation.
   */
  responseType: string
}

/**
 * Applies `config.transform.operation` (global) and `config.patch.operations` (static)
 * to a single operation.
 *
 * The returned object contains the final `name`, `parameters`, and `responseType`.
 * Note: `parameters` are always the same array instance passed in; when overridden
 * by a patch, the array is mutated in place (cleared and re-filled) so callers
 * using a `const` reference remain valid.
 *
 * @group Transform
 */
export function transformOperation(options: OperationTransformOptions) {
  const {
    configRead,
    name: originalName,
    parameters,
    responseType: originalResponseType,
  } = options

  const config = configRead.config || {}

  let name = originalName
  let responseType = originalResponseType

  function applyPatch(patch?: ApiPipeline.Operation) {
    if (!patch)
      return

    if (typeof patch === 'string') {
      name = patch
      return
    }

    if (patch.name)
      name = patch.name

    if (patch.parameters) {
      // Replace parameters in place so existing references stay valid.
      parameters.length = 0
      parameters.push(...patch.parameters)
    }

    if (patch.responseType != null)
      responseType = patch.responseType
  }

  // Global transform first so static patches can target the final name.
  const transformFn = config.transform?.operation
  if (transformFn) {
    const patch = transformFn(name, parameters, responseType)
    applyPatch(patch)
  }

  const staticPatchMap = config.patch?.operations
  if (staticPatchMap) {
    const staticPatch = staticPatchMap[name]
    applyPatch(staticPatch)
  }

  return {
    name,
    parameters,
    responseType,
  }
}
