import type { ApiPipeline } from '@genapi/shared'
import { config as _config } from '@genapi/pipeline'

export function config(userConfig: ApiPipeline.Config): ApiPipeline.ConfigRead {
  userConfig.meta = userConfig.meta || {}
  userConfig.meta.import = userConfig.meta.import || {}
  userConfig.meta.import.http = userConfig.meta.import.http || 'ky'

  const configRead = _config(userConfig)

  configRead.graphs.imports.push({
    name: 'http',
    names: userConfig.meta.import.http === 'ky' ? ['Options'] : undefined,
    value: userConfig.meta.import.http,
  })

  if (userConfig.meta.import.http !== 'ky') {
    configRead.graphs.imports.push({
      names: ['Options'],
      value: 'ky',
    })
  }

  return configRead
}
