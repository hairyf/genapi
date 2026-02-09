import type { ApiPipeline } from '@genapi/shared'
import path from 'node:path'
import { cwd } from 'node:process'
import { createJiti } from 'jiti'

const jiti = createJiti(cwd())

/**
 * Resolves a pipeline from a preset name or function. Tries @genapi/presets/{name}, genapi-{name}, then local path.
 *
 * @param pipe - Preset name (e.g. 'swag-axios-ts') or pipeline function
 * @returns Pipeline function or undefined if not found
 * @example
 * ```ts
 * const pipeline = await inPipeline('swag-axios-ts')
 * await pipeline(config)
 * ```
 */
export async function inPipeline(pipe: string | ApiPipeline.Pipeline): Promise<ApiPipeline.Pipeline | undefined> {
  if (typeof pipe === 'function')
    return pipe as ApiPipeline.Pipeline

  const inputs = [`@genapi/presets/${pipe}`, `genapi-${pipe}`, pipe, absolutePath(pipe)]

  for (const input of inputs) {
    try {
      const inputModule = await jiti.import(input)
      const pipeline = (inputModule as { default?: ApiPipeline.Pipeline })?.default ?? (inputModule as ApiPipeline.Pipeline)
      if (pipeline)
        return pipeline
    }
    catch {}
  }
}

/**
 * Resolves a path to an absolute path; relative paths are resolved against cwd().
 *
 * @param _path - Relative or absolute path (e.g. preset path or file path)
 * @returns Absolute path string
 * @example
 * ```ts
 * absolutePath('./presets/axios') // path.resolve(cwd(), './presets/axios')
 * absolutePath('/etc/config') // '/etc/config'
 * ```
 */
export function absolutePath(_path: string) {
  if (path.isAbsolute(_path))
    return _path
  else
    return path.resolve(cwd(), _path)
}
