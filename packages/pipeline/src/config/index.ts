import type { ApiPipeline, StatementImported, StatementTypeAlias } from '@genapi/shared'
import path from 'node:path'
import process from 'node:process'
import { provide } from '@genapi/shared'

/**
 * Normalizes pipeline config: output paths, responseType, baseURL, and builds ConfigRead with inputs/outputs.
 *
 * @param userConfig - Raw config from defineConfig
 * @returns ConfigRead (config + inputs + outputs)
 * @group Pipeline
 * @example
 * ```ts
 * const configRead = config(defineConfig({ input: 'openapi.json', output: { main: 'src/api.ts' } }))
 * ```
 */
export function config(userConfig: ApiPipeline.Config) {
  // 初始化 meta 对象
  userConfig.meta = userConfig.meta || {}
  userConfig.meta.import = userConfig.meta.import || {}
  userConfig.meta.responseType = userConfig.meta.responseType || {}

  if (typeof userConfig.output === 'string')
    userConfig.output = { main: userConfig.output }

  userConfig.output = userConfig.output || {}
  userConfig.output.main = userConfig.output.main || 'src/api/index.ts'

  if (typeof userConfig.meta.baseURL === 'string') {
    userConfig.meta.baseURL = userConfig.meta.baseURL.endsWith('/"')
      ? userConfig.meta.baseURL = `${userConfig.meta.baseURL.slice(0, userConfig.meta.baseURL.length - 2)}"`
      : userConfig.meta.baseURL
  }

  if (userConfig.output?.type !== false)
    userConfig.output.type = userConfig.output.type || userConfig.output.main.replace(/\.ts|\.js/g, '.type.ts')
  if (typeof userConfig.meta.responseType === 'string')
    userConfig.meta.responseType = { infer: userConfig.meta.responseType }

  const userRoot = process.cwd()
  const isTypescript = userConfig.output.main.endsWith('.ts')
  const isGenerateType = userConfig.output?.type !== false
  const importTypePath = userConfig.meta.import.type || getImportTypePath(userConfig.output.main, userConfig.output.type || '')

  const outputs: ApiPipeline.Output[] = []
  const scopes: Record<string, ApiPipeline.GraphSlice> = {}

  const outputKeys = ['main', ...(userConfig.output.type !== false ? ['type' as const] : []), ...objectOutputKeys(userConfig.output)]
  for (const key of outputKeys) {
    const outPath = key === 'main' ? userConfig.output.main! : (key === 'type' ? userConfig.output.type : (userConfig.output as Record<string, string | false | undefined>)[key])
    if (typeof outPath !== 'string')
      continue
    outputs.push({
      type: key,
      root: path.join(userRoot, path.dirname(outPath)),
      path: path.join(userRoot, outPath),
      ...(key === 'type' ? { import: importTypePath } : {}),
    })
    const mainImports: StatementImported[] = key === 'main' && isTypescript && isGenerateType
      ? [{ name: 'Types', value: importTypePath, type: true, namespace: true }]
      : []
    const typeTypings: StatementTypeAlias[] = key === 'type' && userConfig.meta.responseType?.infer
      ? [{ export: true, name: 'Infer<T>', value: userConfig.meta.responseType.infer }]
      : []
    scopes[key] = {
      comments: [],
      functions: [],
      imports: mainImports,
      variables: [],
      typings: typeTypings,
      interfaces: [],
    }
  }

  const inputs: ApiPipeline.Inputs = {}

  if (typeof userConfig.input === 'string')
    inputs.uri = userConfig.input
  if (typeof userConfig.input === 'object')
    Object.assign(inputs, userConfig.input)

  const configRead: ApiPipeline.ConfigRead<Required<ApiPipeline.Config>> = {
    config: userConfig as Required<ApiPipeline.Config>,
    inputs,
    outputs,
    graphs: {
      scopes,
      response: userConfig.meta.responseType,
    },
  }

  // Inject config, configRead, and Block(imports) so preset config steps can use inject().imports.add(scope, item)
  provide({
    config: userConfig,
    configRead,
    imports: block(configRead, 'imports'),
  })

  return configRead
}

function block<T>(configRead: ApiPipeline.ConfigRead, key: keyof ApiPipeline.GraphSlice): ApiPipeline.Block<T> {
  return {
    add(scope, item) {
      let slice = configRead.graphs.scopes[scope]
      if (!slice) {
        slice = { comments: [], functions: [], imports: [], variables: [], typings: [], interfaces: [] }
        configRead.graphs.scopes[scope] = slice
      }
      if (Array.isArray(slice[key]))
        (slice[key] as T[]).push(item)
    },
    values(scope) {
      const slice = configRead.graphs.scopes[scope]
      return (slice && Array.isArray(slice[key]) ? slice[key] : []) as T[]
    },
    all() {
      return Object.values(configRead.graphs.scopes).flatMap(s => (s[key] || []) as T[])
    },
  }
}

function prefix(path: string) {
  return path.startsWith('.') ? path : `./${path}`
}

function getImportTypePath(main: string, type: string) {
  let importTypePath = path.dirname(main)
  importTypePath = path.relative(importTypePath, type || '')
  importTypePath = prefix(importTypePath).replace('.ts', '')
  return importTypePath
}

/** 从 output 对象中取除 main/type 外的 key（如 api），且值为 string 的 */
function objectOutputKeys(output: ApiPipeline.PreOutput['output']): string[] {
  if (typeof output !== 'object' || output == null)
    return []
  return Object.keys(output).filter(k => k !== 'main' && k !== 'type' && typeof (output as Record<string, unknown>)[k] === 'string')
}
