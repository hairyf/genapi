import type { ApiPipeline } from '@genapi/shared'
import path from 'node:path'
import { config as _config } from '@genapi/pipeline'
import { inject } from '@genapi/shared'

/** Query preset 默认生成三文件：main(hooks)、api(apis)、type(types)；仅 query 生效 output.main / output.api / output.type；type 为 false 时不默认 api，保持单文件 main */
function ensureQueryOutput(userConfig: ApiPipeline.Config) {
  userConfig.output = userConfig.output && typeof userConfig.output === 'object' ? userConfig.output : {}
  const out = userConfig.output as Record<string, string | false | undefined>
  out.main = out.main ?? 'src/api/index.ts'
  out.type = out.type !== false ? (out.type ?? (typeof out.main === 'string' ? out.main.replace(/\.(ts|js)$/, '.type.ts') : 'src/api/index.type.ts')) : false
  if (out.type !== false)
    out.api = out.api ?? (typeof out.main === 'string' ? out.main.replace(/index\.(ts|js)$/, 'index.api.$1') : 'src/api/index.api.ts')
}

function addApiImportToMain(configRead: ApiPipeline.ConfigRead) {
  const mainOut = configRead.outputs.find(o => o.type === 'main')
  const apiOut = configRead.outputs.find(o => o.type === 'api')
  const typeOut = configRead.outputs.find(o => o.type === 'type')
  const { imports } = inject()
  if (mainOut && apiOut) {
    const rel = path.relative(path.dirname(mainOut.path), apiOut.path).replace(/\.(ts|js)$/, '')
    const value = (rel.startsWith('.') ? rel : `./${rel}`).replace(/\\/g, '/')
    imports.add('main', { value, namespace: true, name: 'Api' })
  }
  if (apiOut && typeOut) {
    const rel = path.relative(path.dirname(apiOut.path), typeOut.path).replace(/\.(ts|js)$/, '')
    const value = (rel.startsWith('.') ? rel : `./${rel}`).replace(/\\/g, '/')
    imports.add('api', { value, namespace: true, name: 'Types', type: true })
  }
}

export function config(userConfig: ApiPipeline.Config): ApiPipeline.ConfigRead {
  userConfig.meta = userConfig.meta || {}
  userConfig.meta.import = userConfig.meta.import || {}

  ensureQueryOutput(userConfig)
  const configRead = _config(userConfig)
  const { imports } = inject()

  addApiImportToMain(configRead)
  imports.add('main', {
    names: ['useQuery', 'useMutation'],
    value: '@tanstack/react-query',
  })

  return configRead
}
