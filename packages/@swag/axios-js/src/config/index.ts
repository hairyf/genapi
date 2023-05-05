import type { ApiPipeline } from '@genapi/config'
import { readConfig as _readConfig } from '@genapi/pipeline'

export function readConfig(config: ApiPipeline.Config): ApiPipeline.ConfigRead {
  config.import = config.import || {}
  config.output = config.output || {}
  config.import.http = config.import.http || 'axios'
  config.output.main = config.output.main?.replace('.ts', '.js') || 'src/api/index.js'

  const configRead = _readConfig(config)

  configRead.graphs.imports.push({
    name: 'http',
    value: config.import.http,
  })

  return configRead
}
