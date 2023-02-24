/* eslint-disable @typescript-eslint/no-var-requires */
import process from 'process'
import path from 'path'
import type { ApiPipeline, StatementImported } from 'apipgen'

const USER_ROOT = process.cwd()

export function readConfig(config: ApiPipeline.Config): ApiPipeline.ConfigRead {
  config.import = config.import || {}
  config.output = config.output || {}
  config.import.http = config.import.http || 'axios'
  config.output.main = config.output.main || 'src/api/index.ts'
  if (config.output.type !== false)
    config.output.type = config.output.type || config.output.main.replace(/\.ts|\.js/g, '.type.ts')
  config.responseType = config.responseType || 'T'

  const imports: (StatementImported | false)[] = [
    {
      name: 'http',
      names: config.import.http === 'axios' ? ['AxiosRequestConfig'] : undefined,
      value: config.import.http,
    },
    config.import.http === 'axios' && {
      names: ['AxiosRequestConfig'],
      value: 'axios',
    },
    {
      name: 'OpenAPITypes',
      value: config.import?.type || '',
      namespace: true,
    },
  ]

  const outputs: ApiPipeline.Output[] = [
    {
      type: 'request',
      root: path.join(USER_ROOT, path.dirname(config.output.main)),
      import: config.output.main.replace(/\.ts$/, ''),
      path: path.join(USER_ROOT, config.output.main),
    },
  ]

  if (config.output.type !== false) {
    outputs.push({
      type: 'typings',
      root: path.join(USER_ROOT, path.dirname(config.output.type)),
      import: prefix(path.relative(path.dirname(config.output.main), config.output.type)),
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
    },
  }

  return configRead
}

function prefix(path: string) {
  return path.startsWith('.') ? path : `./${path}`
}

function readJson(json: string | Record<string, any>): Record<string, any> | undefined {
  if (typeof json === 'object')
    return json
  else
    return require(json)?.default || require(json)
}
