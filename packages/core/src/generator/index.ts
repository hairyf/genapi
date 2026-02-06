import type { ApiPipeline } from '@genapi/shared'
import { exit } from 'node:process'
import { spinner } from '@clack/prompts'
import { inPipeline } from '../internal'

/**
 * Runs the GenAPI pipeline for one or more configs.
 * Resolves pipeline by name (e.g. `swag-axios-ts`), then runs config → original → parser → compiler → generate → dest.
 *
 * @param config - Single config or array of configs (e.g. from `servers`)
 * @group Core
 */
export async function operatePipelineGenerator(config: ApiPipeline.Config | ApiPipeline.Config[]) {
  const configs: ApiPipeline.Config[] = Array.isArray(config) ? config : [config]
  const s = spinner()
  s.start('Generate API File...')

  const process = configs.map((config) => {
    const pipeline = inPipeline(config.preset || 'swag-axios-ts')
    if (!pipeline)
      throw new Error(`Pipeline not found ${config.preset}`)
    return pipeline(config)
  })

  try {
    await Promise.all(process)
    s.stop('✅ Generated successfully')
  }
  catch (error: any) {
    s.stop('❌ Generate API File Error')
    console.error(error)
    exit()
  }
}
