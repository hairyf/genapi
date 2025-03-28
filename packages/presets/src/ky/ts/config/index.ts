import type { ApiPipeline } from '@genapi/shared'
import { config as _config } from '@genapi/pipeline'

export function config(userConfig: ApiPipeline.Config): ApiPipeline.ConfigRead {
  userConfig.import = userConfig.import || {}
  userConfig.import.http = userConfig.import.http || 'ky'

  const configRead = _config(userConfig)

  configRead.graphs.imports.push({
    name: 'http',
    names: userConfig.import.http === 'ky' ? ['Options'] : undefined,
    value: userConfig.import.http,
  })

  if (userConfig.import.http !== 'ky') {
    configRead.graphs.imports.push({
      names: ['Options'],
      value: 'ky',
    })
  }

  return configRead
}
