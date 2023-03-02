/* eslint-disable @typescript-eslint/no-var-requires */
import process from 'process'
import path from 'path'
import type { ApiPipeline, StatementImported, StatementVariable } from 'apipgen'

const USER_ROOT = process.cwd()

export function readConfig(config: ApiPipeline.Config): ApiPipeline.ConfigRead {
  config.import = config.import || {}
  config.output = config.output || {}
  config.import.http = config.import.http || 'axios'
  config.output.main = config.output.main || 'src/api/index.js'
  config.responseType = config.responseType || 'T'
  if (config.output?.type !== false)
    config.output.type = config.output.type || config.output.main.replace(/\.ts|\.js/g, '.type.ts')

  const importType = prefix(
    path.relative(
      path.dirname(config.output.main), config.output.type || ''),
  ).replace('.ts', '')

  const imports: (StatementImported | false)[] = [
    {
      name: 'http',
      value: config.import.http,
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
      root: path.join(USER_ROOT, path.dirname(config.output.main)),
      path: path.join(USER_ROOT, config.output.main),
    },
  ]

  if (config.output.type !== false) {
    outputs.push({
      type: 'typings',
      root: path.join(USER_ROOT, path.dirname(config.output.type)),
      import: importType,
      path: path.join(USER_ROOT, config.output.type),
    })
  }

  const inputs: ApiPipeline.Inputs = {}

  if (typeof config.input === 'string')
    inputs.uri = config.input
  if (typeof config.input === 'object') {
    const { uri, json } = config.input as Record<string, any>
    inputs.uri = uri
    inputs.json = readJson(json)
  }

  const configRead: ApiPipeline.ConfigRead = {
    config,
    inputs,
    outputs,
    graphs: {
      imports: imports.filter(Boolean) as StatementImported[],
      variables: variables.filter(Boolean) as StatementVariable[],
    },
  }

  return configRead
}

function prefix(path: string) {
  return path.startsWith('.') ? path : `./${path}`
}

function readJson(json: string | Record<string, any>): Record<string, any> | undefined {
  if (!json)
    return undefined
  if (typeof json === 'object')
    return json
  else
    return require(json)?.default || require(json)
}
