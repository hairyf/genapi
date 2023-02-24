import type { ApiPipeline } from 'apipgen'
import { pipeline } from 'apipgen'
import { readConfig } from './config'
import { original } from './original'

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

export default OpenAPI2Typescript
