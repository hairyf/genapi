import type { ApiPipeline } from '@genapi/shared'
import { replaceMainext } from '@genapi/parser'
import { config as _config } from '@genapi/pipeline'

export function config(userConfig: ApiPipeline.Config): ApiPipeline.ConfigRead {
  userConfig.import = userConfig.import || {}
  userConfig.output = userConfig.output || {}
  userConfig.import.http = userConfig.import.http || 'got'
  userConfig.output = replaceMainext(userConfig.output) || 'src/api/index.js'

  const configRead = _config(userConfig)

  configRead.graphs.imports.push({
    name: 'http',
    value: userConfig.import.http,
  })

  return configRead
}
