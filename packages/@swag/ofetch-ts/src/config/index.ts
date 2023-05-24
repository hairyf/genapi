import type { ApiPipeline } from '@genapi/config'
import { readConfig as _readConfig } from '@genapi/pipeline'

export function readConfig(config: ApiPipeline.Config): ApiPipeline.ConfigRead {
  config.import = config.import || {}
  config.import.http = config.import.http || 'ofetch'

  const configRead = _readConfig(config)

  configRead.graphs.imports.push({
    name: 'ofetch',
    names: config.import.http === 'ofetch' ? ['FetchOptions'] : undefined,
    value: config.import.http,
  })

  if (config.import.http !== 'ofetch') {
    configRead.graphs.imports.push({
      names: ['FetchOptions'],
      value: 'ofetch',
    })
  }

  return configRead
}
