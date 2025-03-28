import type { ApiPipeline } from '@genapi/shared'
import { config as _config } from '@genapi/pipeline'

export function config(userConfig: ApiPipeline.Config): ApiPipeline.ConfigRead {
  userConfig.import = userConfig.import || {}
  userConfig.import.http = userConfig.import.http || 'axios'

  const configRead = _config(userConfig)

  configRead.graphs.imports.push({
    name: 'http',
    names: userConfig.import.http === 'axios' ? ['AxiosRequestConfig'] : undefined,
    value: userConfig.import.http,
  })

  if (userConfig.import.http !== 'axios') {
    configRead.graphs.imports.push({
      names: ['AxiosRequestConfig'],
      value: 'axios',
    })
  }

  return configRead
}
