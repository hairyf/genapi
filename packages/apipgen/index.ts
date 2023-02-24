import ora from 'ora'
import type ApiPipeline from './typings'
import { inPipeline } from './utils'

export async function openPipeWebClientGenerator(config: ApiPipeline.Config | ApiPipeline.Config[]) {
  const configs: ApiPipeline.Config[] = Array.isArray(config) ? config : [config]
  const spinner = ora('Generate API File...\n').start()

  const process = configs.map((config) => {
    const pipeline = inPipeline(config.pipeline || 'swag-ts')
    if (!pipeline)
      throw new Error(`Pipeline not found ${config.pipeline}`)
    return pipeline(config)
  })

  await Promise.all(process)

  spinner.succeed()
  spinner.clear()
}

export * from './config'
export * from './typings'
export * from './pipeline'
