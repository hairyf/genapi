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
    // TODO
    configRead => compiler(configRead),
    // TODO
    configRead => generate(configRead),
    // TODO
    configRead => dest(configRead),
  )
  return process(config)
}

export default OpenAPI2Typescript
