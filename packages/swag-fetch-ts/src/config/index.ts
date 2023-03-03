import type { ApiPipeline } from 'apipgen'
import { readConfig as _readConfig } from '@apipgen/pipeline'

export function readConfig(config: ApiPipeline.Config): ApiPipeline.ConfigRead {
  config.import = config.import || {}
  config.import.http = config.import.http || 'axios'

  const configRead = _readConfig(config)

  return configRead
}
