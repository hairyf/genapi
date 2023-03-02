import type { ApiPipeline } from 'apipgen'
import { pipeline } from 'apipgen'
import { compiler } from './compiler'
import { readConfig } from './config'
import { dest } from './dest'
import { generate } from './generate'
import { original } from './original'
import { parser } from './parser'

function OpenAPI2Typescript(config: ApiPipeline.Config) {
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
export { readConfig, original, parser, compiler, generate, dest }

export default OpenAPI2Typescript
