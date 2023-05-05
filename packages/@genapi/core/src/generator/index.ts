import { exit } from 'process'
import ora from 'ora'
import type { ApiPipeline } from '@genapi/config'
import { inPipeline } from '../utils'

export async function openPipeWebClientGenerator(config: ApiPipeline.Config | ApiPipeline.Config[]) {
  const configs: ApiPipeline.Config[] = Array.isArray(config) ? config : [config]
  const spinner = ora('Generate API File...\n').start()

  const process = configs.map((config) => {
    const pipeline = inPipeline(config.pipeline || 'swag-axios-ts')
    if (!pipeline)
      throw new Error(`Pipeline not found ${config.pipeline}`)
    return pipeline(config)
  })

  try {
    await Promise.all(process)
    spinner.succeed()
    spinner.clear()
  }
  catch (error: any) {
    spinner.clear()
    spinner.fail('Generate API File Error')
    console.error(error)
    exit()
  }
}
