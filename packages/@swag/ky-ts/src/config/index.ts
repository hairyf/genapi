import type { ApiPipeline } from '@genapi/config'
import { readConfig as _readConfig } from '@genapi/pipeline'

export function readConfig(config: ApiPipeline.Config): ApiPipeline.ConfigRead {
  config.import = config.import || {}
  config.import.http = config.import.http || 'ky'

  const configRead = _readConfig(config)

  configRead.graphs.imports.push({
    name: 'http',
    names: config.import.http === 'ky' ? ['Options'] : undefined,
    value: config.import.http,
  })

  if (config.import.http !== 'ky') {
    configRead.graphs.imports.push({
      names: ['Options'],
      value: 'ky',
    })
  }

  return configRead
}
