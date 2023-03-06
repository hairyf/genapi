import type { ApiPipeline } from 'apipgen'
import { readConfig as _readConfig } from '@apipgen/pipeline'

export function readConfig(config: ApiPipeline.Config): ApiPipeline.ConfigRead {
  config.import = config.import || {}
  config.import.http = config.import.http || 'got'

  const configRead = _readConfig(config)

  configRead.graphs.imports.push({
    name: 'http',
    names: config.import.http === 'got' ? ['OptionsOfTextResponseBody'] : undefined,
    value: config.import.http,
  })

  if (config.import.http !== 'got') {
    configRead.graphs.imports.push({
      names: ['OptionsOfTextResponseBody'],
      value: 'got',
    })
  }

  return configRead
}
