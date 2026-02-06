import type { ApiPipeline } from '@genapi/shared'
import { replaceMainext } from '@genapi/parser'
import { config as _config } from '@genapi/pipeline'

export function config(userConfig: ApiPipeline.Config): ApiPipeline.ConfigRead {
  userConfig.meta = userConfig.meta || {}
  userConfig.meta.import = userConfig.meta.import || {}
  userConfig.output = userConfig.output || {}
  userConfig.output = replaceMainext(userConfig.output) || 'src/api/index.js'
  const configRead = _config(userConfig)

  return configRead
}
