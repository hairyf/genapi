import type { ApiPipeline } from '@genapi/shared'
import { config as _config } from '@genapi/pipeline'

export function config(userConfig: ApiPipeline.Config): ApiPipeline.ConfigRead {
  userConfig.meta = userConfig.meta || {}
  userConfig.meta.import = userConfig.meta.import || {}
  userConfig.meta.import.http = userConfig.meta.import.http || 'axios'

  const configRead = _config(userConfig)

  configRead.graphs.imports.push({
    name: 'http',
    names: userConfig.meta.import.http === 'axios' ? ['AxiosRequestConfig'] : undefined,
    value: userConfig.meta.import.http,
  })

  if (userConfig.meta.import.http !== 'axios') {
    configRead.graphs.imports.push({
      names: ['AxiosRequestConfig'],
      value: 'axios',
    })
  }

  return configRead
}
