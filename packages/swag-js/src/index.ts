import type { ApiPipeline } from 'apipgen'
import { pipeline } from 'apipgen'
import { dest, generate, original } from 'apipgen-swag-ts-axios'
import { compiler } from './compiler'
import { readConfig } from './config'
import { parser } from './parser'

function OpenAPI2Javascript(config: ApiPipeline.Config) {
  const process = pipeline(
    config => readConfig(config),
    configRead => original(configRead),
    configRead => parser(configRead),
    configRead => compiler(configRead),
    configRead => generate(configRead),
    configRead => dest(configRead),
  )
  return process(config)
}
export { readConfig, original, parser, compiler, generate }

export default OpenAPI2Javascript
