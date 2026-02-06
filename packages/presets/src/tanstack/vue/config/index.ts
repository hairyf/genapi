import type { ApiPipeline } from '@genapi/shared'
import { config as _config } from '@genapi/pipeline'

export function config(userConfig: ApiPipeline.Config): ApiPipeline.ConfigRead {
  userConfig.meta = userConfig.meta || {}
  userConfig.meta.import = userConfig.meta.import || {}

  const configRead = _config(userConfig)

  configRead.graphs.imports.push({
    names: ['useQuery', 'useMutation'],
    value: '@tanstack/vue-query',
  })

  return configRead
}
