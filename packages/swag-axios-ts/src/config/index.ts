import type { ApiPipeline } from 'apipgen'
import { readConfig as _readConfig } from '@apipgen/pipeline'

export function readConfig(config: ApiPipeline.Config): ApiPipeline.ConfigRead {
  config.import = config.import || {}
  config.import.http = config.import.http || 'axios'

  const configRead = _readConfig(config)

  configRead.graphs.imports.push({
    name: 'http',
    names: config.import.http === 'axios' ? ['AxiosRequestConfig'] : undefined,
    value: config.import.http,
  })

  if (config.import.http !== 'axios') {
    configRead.graphs.imports.push({
      names: ['AxiosRequestConfig'],
      value: 'axios',
    })
  }

  return configRead
}
