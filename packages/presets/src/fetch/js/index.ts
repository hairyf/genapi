import type { ApiPipeline } from '@genapi/shared'
import pipeline, { compiler, dest, generate, original } from '@genapi/pipeline'
import { config } from './config'
import { parser } from './parser'

function openapiPipeline(userConfig: ApiPipeline.Config) {
  const process = pipeline(
    userConfig => config(userConfig),
    configRead => original(configRead),
    configRead => parser(configRead),
    configRead => compiler(configRead),
    configRead => generate(configRead),
    configRead => dest(configRead),
  )
  return process(userConfig)
}
export { compiler, config, dest, generate, original, parser }

openapiPipeline.config = config
openapiPipeline.original = original
openapiPipeline.parser = parser
openapiPipeline.compiler = compiler
openapiPipeline.generate = generate
openapiPipeline.dest = dest
export default openapiPipeline
