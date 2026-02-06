import type { ApiPipeline } from '@genapi/shared'
import { config as _config } from '@genapi/pipeline'

export function config(userConfig: ApiPipeline.Config): ApiPipeline.ConfigRead {
  userConfig.meta = userConfig.meta || {}
  userConfig.meta.import = userConfig.meta.import || {}
  userConfig.meta.import.http = userConfig.meta.import.http || 'ofetch'

  const configRead = _config(userConfig)

  configRead.graphs.imports.push({
    value: userConfig.meta.import.http,
    names: ['ofetch'],
  })

  configRead.graphs.imports.push({
    names: [
      'TypedFetchInput',
      'TypedFetchRequestInit',
      'TypedFetchResponseBody',
      'TypedResponse',
      'Endpoint',
      'DynamicParam',
    ],
    value: 'fetchdts',
  })

  return configRead
}
