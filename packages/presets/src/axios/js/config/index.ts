import type { ApiPipeline } from '@genapi/shared'
import { replaceMainext } from '@genapi/parser'
import { config as _config } from '@genapi/pipeline'
import { inject } from '@genapi/shared'

export function config(userConfig: ApiPipeline.Config): ApiPipeline.ConfigRead {
  userConfig.meta = userConfig.meta || {}
  userConfig.meta.import = userConfig.meta.import || {}
  userConfig.output = userConfig.output || {}
  userConfig.meta.import.http = userConfig.meta.import.http || 'axios'
  userConfig.output = replaceMainext(userConfig.output) || 'src/api/index.js'

  const configRead = _config(userConfig)
  const { imports } = inject()

  imports.add('main', {
    name: 'http',
    value: userConfig.meta.import.http,
  })

  return configRead
}
