import type { ApiPipeline } from '@genapi/shared'
import path from 'node:path'
import { config as _config } from '@genapi/pipeline'
import { inject } from '@genapi/shared'

/** Query preset Default Output: main(hooks)、api(apis)、type(types)；Query preset only effective output.main / output.api / output.type；type is false, not default api, keep single file main */
export function ensureQueryOutput(userConfig: ApiPipeline.Config) {
  userConfig.output = userConfig.output && typeof userConfig.output === 'object' ? userConfig.output : {}
  const out = userConfig.output as Record<string, string | false | undefined>
  out.main = out.main ?? 'src/api/index.ts'
  out.type = out.type !== false ? (out.type ?? (typeof out.main === 'string' ? out.main.replace(/\.(ts|js)$/, '.type.ts') : 'src/api/index.type.ts')) : false
  if (out.type !== false)
    out.api = out.api ?? (typeof out.main === 'string' ? out.main.replace(/index\.(ts|js)$/, 'index.api.$1') : 'src/api/index.api.ts')
}

/** main import api file (apis.xxx reference); api import type file (Types reference) */
export function addApiImportToMain(configRead: ApiPipeline.ConfigRead) {
  const mainOut = configRead.outputs.find(o => o.type === 'main')
  const apiOut = configRead.outputs.find(o => o.type === 'api')
  const typeOut = configRead.outputs.find(o => o.type === 'type')
  const { imports } = inject()
  if (mainOut && apiOut) {
    const rel = path.relative(path.dirname(mainOut.path), apiOut.path).replace(/\.(ts|js)$/, '')
    const value = (rel.startsWith('.') ? rel : `./${rel}`).replace(/\\/g, '/')
    imports.add('main', { value, namespace: true, name: 'apis' })
  }
  if (apiOut && typeOut) {
    const rel = path.relative(path.dirname(apiOut.path), typeOut.path).replace(/\.(ts|js)$/, '')
    const value = (rel.startsWith('.') ? rel : `./${rel}`).replace(/\\/g, '/')
    imports.add('api', { value, namespace: true, name: 'Types', type: true })
  }
}

export interface QueryConfigOptions {
  /** Query library name (e.g., @pinia/colada, @tanstack/react-query, @tanstack/vue-query) */
  queryLibrary: string
}

export function createQueryConfig(options: QueryConfigOptions | string) {
  const queryLibrary = typeof options === 'string' ? options : options.queryLibrary
  return function config(userConfig: ApiPipeline.Config): ApiPipeline.ConfigRead {
    userConfig.meta = userConfig.meta || {}
    userConfig.meta.import = userConfig.meta.import || {}

    ensureQueryOutput(userConfig)
    const configRead = _config(userConfig)
    const { imports } = inject()

    addApiImportToMain(configRead)
    imports.add('main', {
      names: ['useQuery', 'useMutation'],
      value: queryLibrary,
    })

    return configRead
  }
}
