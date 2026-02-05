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
 */
export function config(userConfig: ApiPipeline.Config) {
  userConfig.import = userConfig.import || {}

  userConfig.responseType = userConfig.responseType || {}

  if (typeof userConfig.output === 'string')
    userConfig.output = { main: userConfig.output }

  userConfig.output = userConfig.output || {}
  userConfig.output.main = userConfig.output.main || 'src/api/index.ts'

  if (typeof userConfig.baseURL === 'string') {
    userConfig.baseURL = userConfig.baseURL.endsWith('/"')
      ? userConfig.baseURL = `${userConfig.baseURL.slice(0, userConfig.baseURL.length - 2)}"`
      : userConfig.baseURL
  }

  if (userConfig.output?.type !== false)
    userConfig.output.type = userConfig.output.type || userConfig.output.main.replace(/\.ts|\.js/g, '.type.ts')
  if (typeof userConfig.responseType === 'string')
    userConfig.responseType = { infer: userConfig.responseType }

  const userRoot = process.cwd()
  const isTypescript = userConfig.output.main.endsWith('.ts')
  const isGenerateType = userConfig.output?.type !== false
  const importTypePath = userConfig.import.type || getImportTypePath(userConfig.output.main, userConfig.output.type || '')

  const imports: (StatementImported | false)[] = [
    isTypescript && isGenerateType && {
      name: 'Types',
      value: importTypePath,
      type: true,
      namespace: true,
    },
  ]

  const outputs: ApiPipeline.Output[] = [
    {
      type: 'request',
      root: path.join(userRoot, path.dirname(userConfig.output.main)),
      path: path.join(userRoot, userConfig.output.main),
    },
  ]

  const typings: (StatementTypeAlias | boolean)[] = [
    !!userConfig.responseType.infer && { export: true, name: 'Infer<T>', value: userConfig.responseType.infer! },
  ]

  if (userConfig.output.type !== false) {
    outputs.push({
      type: 'typings',
      root: path.join(userRoot, path.dirname(userConfig.output.type)),
      import: importTypePath,
      path: path.join(userRoot, userConfig.output.type),
    })
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
      imports: imports.filter(Boolean) as StatementImported[],
      variables: [],
      comments: [],
      functions: [],
      interfaces: [],
      typings: typings.filter(Boolean) as StatementTypeAlias[],
      response: userConfig.responseType,
    },
  }

  // Inject config and configRead into default context
  // Referenced at:
  // - packages/parser/src/parses/method.ts:20 (inject() gets config)
  // - packages/parser/src/parses/method.ts:95 (inject() gets configRead)
  // - packages/parser/src/parses/schema.ts:24 (inject() gets configRead)
  // - packages/parser/src/transform/definitions.ts:12 (inject() gets configRead)
  // - packages/parser/src/transform/urls.ts:73 (inject() gets configRead)
  // - packages/parser/src/create-parser.ts:43 (inject() gets configRead)
  provide({ config: userConfig, configRead })

  return configRead
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
