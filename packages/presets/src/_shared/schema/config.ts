import type { ApiPipeline } from '@genapi/shared'
import { config as _config } from '@genapi/pipeline'

export interface SchemaConfigOptions {
  /** HTTP client package name (e.g., 'ofetch') */
  httpPackage?: string
  /** HTTP client function name to import (e.g., 'ofetch') */
  httpClientName?: string
}

export function createSchemaConfig(options: SchemaConfigOptions = {}) {
  return function config(userConfig: ApiPipeline.Config): ApiPipeline.ConfigRead {
    userConfig.meta = userConfig.meta || {}
    userConfig.meta.import = userConfig.meta.import || {}

    if (options.httpPackage && options.httpClientName) {
      userConfig.meta.import.http = userConfig.meta.import.http || options.httpPackage

      const configRead = _config(userConfig)

      configRead.graphs.imports.push({
        value: userConfig.meta.import.http,
        names: [options.httpClientName],
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

    // For native fetch, no HTTP client import needed
    const configRead = _config(userConfig)

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
}
