import type { ApiPipeline } from '@genapi/shared'

/**
 * use genapi.config.ts|.. file options
 * @param config
 */
export function defineConfig(config: ApiPipeline.Config): ApiPipeline.Config
export function defineConfig(config: ApiPipeline.ConfigServers): ApiPipeline.ConfigServers
export function defineConfig(config: any) {
  return config
}
