import type { ApiPipeline, StatementFunction, StatementInterface } from '@genapi/shared'
import type { Paths } from 'openapi-specification-types'
import {
  literalFieldsToString,
  parseHeaderCommits,
  parseMethodMetadata,
  parseMethodParameters,
  parseOpenapiSpecification,
  transformBaseURL,
  transformDefinitions,
  transformParameters,
  transformUrlSyntax,
  traversePaths,
} from '@genapi/parser'
import { inject, provide } from '@genapi/shared'

export interface PathsTransformOptions {
  configRead: ApiPipeline.ConfigRead
  interfaces: StatementInterface[]
  functions: StatementFunction[]
}

export function parser(configRead: ApiPipeline.ConfigRead) {
  const source = parseOpenapiSpecification(configRead.source)

  const comments = parseHeaderCommits(source)

  const interfaces: StatementInterface[] = []
  const functions: StatementFunction[] = []

  provide({ interfaces, functions })

  transformBaseURL(source)

  transformDefinitions(source.definitions)

  transformPaths(source.paths)

  configRead.graphs.comments = comments
  configRead.graphs.functions = functions
  configRead.graphs.interfaces = interfaces

  return configRead
}

export function transformPaths(paths: Paths) {
  const { configRead, functions, interfaces } = inject()
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
      type: 'import(\'@uni-helper/uni-network\').UnConfig<never>',
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
      generic: 'import(\'@uni-helper/uni-network\').UnResponse<{__type__}>',
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
