import type { ApiPipeline } from '@genapi/shared'
import { config as _config } from '@genapi/pipeline'
import { inject } from '@genapi/shared'

export function config(userConfig: ApiPipeline.Config): ApiPipeline.ConfigRead {
  userConfig.meta = userConfig.meta || {}
  userConfig.meta.import = userConfig.meta.import || {}
  userConfig.meta.import.http = userConfig.meta.import.http || 'axios'

  const configRead = _config(userConfig)
  const { imports } = inject()

  imports.add('main', {
    name: 'http',
    names: userConfig.meta.import.http === 'axios' ? ['AxiosRequestConfig'] : undefined,
    value: userConfig.meta.import.http,
  })

  if (userConfig.meta.import.http !== 'axios') {
    imports.add('main', {
      names: ['AxiosRequestConfig'],
      value: 'axios',
    })
  }

  return configRead
}
