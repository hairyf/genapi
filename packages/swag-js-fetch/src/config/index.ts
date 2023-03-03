import type { ApiPipeline } from 'apipgen'
import { readConfig as _readConfig } from '@apipgen/pipeline'

export function readConfig(config: ApiPipeline.Config): ApiPipeline.ConfigRead {
  config.import = config.import || {}
  config.output = config.output || {}
  config.output.main = config.output.main?.replace('.ts', '.js') || 'src/api/index.js'
  const configRead = _readConfig(config)

  return configRead
}
