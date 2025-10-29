import type { ApiPipeline } from '@genapi/shared'
import { config as _config } from '@genapi/pipeline'

export function config(userConfig: ApiPipeline.Config): ApiPipeline.ConfigRead {
  userConfig.import = userConfig.import || {}
  userConfig.import.http = userConfig.import.http || '@uni-helper/uni-network'

  const configRead = _config(userConfig)

  configRead.graphs.imports.push({
    name: 'http',
    names: userConfig.import.http === '@uni-helper/uni-network' ? ['UnConfig'] : undefined,
    value: userConfig.import.http,
  })

  if (userConfig.import.http !== '@uni-helper/uni-network') {
    configRead.graphs.imports.push({
      names: ['UnConfig'],
      value: '@uni-helper/uni-network',
    })
  }

  return configRead
}
