import path from 'node:path'
import type { ApiPipeline, StatementImported, StatementTypeAlias } from '@genapi/config'

export function readConfig(config: ApiPipeline.Config) {
  config.import = config.import || {}

  config.responseType = config.responseType || {}

  if (typeof config.output === 'string')
    config.output = { main: config.output }

  config.output = config.output || {}
  config.output.main = config.output.main || 'src/api/index.ts'

  if (typeof config.baseURL === 'string') {
    config.baseURL = config.baseURL.endsWith('/"')
      ? config.baseURL = `${config.baseURL.slice(0, config.baseURL.length - 2)}"`
      : config.baseURL
  }

  if (config.output?.type !== false)
    config.output.type = config.output.type || config.output.main.replace(/\.ts|\.js/g, '.type.ts')
  if (typeof config.responseType === 'string')
    config.responseType = { infer: config.responseType }

  const userRoot = process.cwd()
  const isTypescript = config.output.main.endsWith('.ts')
  const isGenerateType = config.output?.type !== false
  const importTypePath = config.import.type || getImportTypePath(config.output.main, config.output.type || '')

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
      root: path.join(userRoot, path.dirname(config.output.main)),
      path: path.join(userRoot, config.output.main),
    },
  ]

  const typings: (StatementTypeAlias | boolean)[] = [
    !!config.responseType.infer && { export: true, name: 'Infer<T>', value: config.responseType.infer! },
  ]

  if (config.output.type !== false) {
    outputs.push({
      type: 'typings',
      root: path.join(userRoot, path.dirname(config.output.type)),
      import: importTypePath,
      path: path.join(userRoot, config.output.type),
    })
  }

  const inputs: ApiPipeline.Inputs = {}

  if (typeof config.input === 'string')
    inputs.uri = config.input
  if (typeof config.input === 'object')
    Object.assign(inputs, config.input)

  const configRead: ApiPipeline.ConfigRead<Required<ApiPipeline.Config>> = {
    config: config as any,
    inputs,
    outputs,
    graphs: {
      imports: imports.filter(Boolean) as StatementImported[],
      variables: [],
      comments: [],
      functions: [],
      interfaces: [],
      typings: typings.filter(Boolean) as StatementTypeAlias[],
      response: config.responseType,
    },
  }

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
