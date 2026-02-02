import type { ApiPipeline } from '@genapi/shared'

/**
 * Defines GenAPI config for `genapi.config.ts` / `genapi.config.js`.
 * Supports single-service config or multi-service `servers` config.
 *
 * @param config - Single-service config or config with `servers` array
 * @returns The same config object for type inference
 * @example
 * ```ts
 * export default defineConfig({
 *   pipeline: axios.ts,
 *   input: 'http://example.com/api-docs',
 *   output: { main: 'src/api/index.ts', type: 'src/api/index.type.ts' },
 * })
 * ```
 */
export function defineConfig(config: ApiPipeline.Config): ApiPipeline.Config
export function defineConfig(config: ApiPipeline.ConfigServers): ApiPipeline.ConfigServers
export function defineConfig(config: any) {
  return config
}
