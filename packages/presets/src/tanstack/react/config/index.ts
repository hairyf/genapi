import type { ApiPipeline } from '@genapi/shared'
import { config as _config } from '@genapi/pipeline'
import { inject } from '@genapi/shared'

export function config(userConfig: ApiPipeline.Config): ApiPipeline.ConfigRead {
  userConfig.meta = userConfig.meta || {}
  userConfig.meta.import = userConfig.meta.import || {}

  const configRead = _config(userConfig)
  const { imports } = inject()

  imports.add('main', {
    names: ['useQuery', 'useMutation'],
    value: '@tanstack/react-query',
  })

  return configRead
}
