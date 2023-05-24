import type { ApiPipeline, StatementFunction, StatementInterface } from '@genapi/config'
import type { Paths } from 'openapi-specification-types'
import {
  literalFieldsToString,
  parseHeaderCommits,
  parseMethodMetadata,
  parseMethodParameters,
  parseOpenAPISpecification32,
  transformBaseURL,
  transformDefinitions,
  transformParameters,
  transformUrlSyntax,
  traversePaths,
} from '@genapi/swag-parser'

export interface PathsTransformOptions {
  configRead: ApiPipeline.ConfigRead
  interfaces: StatementInterface[]
  functions: StatementFunction[]
}

export function parser(configRead: ApiPipeline.ConfigRead) {
  const source = parseOpenAPISpecification32(configRead.source)

  const comments = parseHeaderCommits(source)

  const interfaces: StatementInterface[] = []
  const functions: StatementFunction[] = []

  transformBaseURL(source, {
    configRead,
  })

  transformDefinitions(source.definitions, {
    interfaces,
  })

  transformPaths(source.paths, {
    configRead,
    functions,
    interfaces,
  })

  configRead.graphs.comments = comments
  configRead.graphs.functions = functions
  configRead.graphs.interfaces = interfaces

  return configRead
}

export function transformPaths(paths: Paths, { configRead, functions, interfaces }: PathsTransformOptions) {
  traversePaths(paths, (config) => {
    /**
     * function params/function options/function use interfaces
     */
    const { parameters, interfaces: attachInters, options } = parseMethodParameters(config, {
      body: 'data',
      query: 'params',
    })
    let { name, description, url, responseType } = parseMethodMetadata(config)

    options.push(['...', 'config'])
    interfaces.push(...attachInters)
    parameters.push({
      type: 'import(\'axios\').AxiosRequestConfig',
      name: 'config',
      required: false,
    })
    options.unshift('url')
    options.unshift(['method', `"${config.method}"`])
    if (configRead.config.baseURL)
      options.unshift('baseURL')

    transformParameters(parameters, {
      syntax: 'ecmascript',
      configRead,
      description,
      interfaces,
      responseType,
      generic: 'import(\'axios\').AxiosResponse<{__type__}>',
    })

    url = transformUrlSyntax(url)

    functions.push({
      export: true,
      name,
      description,
      parameters,
      body: [
        `const url = ${url}`,
        `return http.request({ ${literalFieldsToString(options)} })`,
      ],
    })
  })
}
