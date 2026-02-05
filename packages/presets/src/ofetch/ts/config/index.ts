import type { ApiPipeline } from '@genapi/shared'
import { config as _config } from '@genapi/pipeline'

export function config(userConfig: ApiPipeline.Config): ApiPipeline.ConfigRead {
  userConfig.import = userConfig.import || {}
  userConfig.import.http = userConfig.import.http || 'ofetch'

  const configRead = _config(userConfig)

  configRead.graphs.imports.push({
    names: userConfig.import.http === 'ofetch' ? ['FetchOptions', 'ofetch'] : ['ofetch'],
    value: userConfig.import.http,
  })

  if (userConfig.import.http !== 'ofetch') {
    configRead.graphs.imports.push({
      names: ['FetchOptions'],
      value: 'ofetch',
    })
  }

  return configRead
}
