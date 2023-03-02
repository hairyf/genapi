import path from 'path'
import type { ApiPipeline, StatementImported, StatementVariable } from 'apipgen'

export function readConfig(config: ApiPipeline.Config) {
  config.import = config.import || {}
  config.output = config.output || {}
  config.output.main = config.output.main || 'src/api/index.ts'
  config.responseType = config.responseType || 'T'
  if (config.output?.type !== false)
    config.output.type = config.output.type || config.output.main.replace(/\.ts|\.js/g, '.type.ts')

  const userRoot = process.cwd()
  const isGenerateType = config.output?.type !== false
  const importTypePath = config.import.type || getImportTypePath(config.output.main, config.output.type || '')

  const imports: (StatementImported | false)[] = [
    isGenerateType && {
      name: 'OpenAPITypes',
      value: importTypePath,
      namespace: true,
    },
    isGenerateType && {
      names: ['Response'],
      value: importTypePath,
    },
  ]

  const variables: (StatementVariable | false)[] = [
    !!config.baseURL && {
      flag: 'const',
      name: 'baseURL',
      value: config.baseURL,
    },
  ]

  const outputs: ApiPipeline.Output[] = [
    {
      type: 'request',
      root: path.join(userRoot, path.dirname(config.output.main)),
      path: path.join(userRoot, config.output.main),
    },
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
      variables: variables.filter(Boolean) as StatementVariable[],
      comments: [],
      functions: [],
      interfaces: [],
      typings: [],
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
