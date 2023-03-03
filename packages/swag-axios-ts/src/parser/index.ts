import type { ApiPipeline, StatementFunction, StatementInterface } from 'apipgen'
import type { OpenAPISpecificationV2, Paths } from 'openapi-specification-types'
import {
  literalFieldsToString,
  parseHeaderCommits,
  parseMethodMetadata,
  parseMethodParameters,
  transformDefinitions,
  transformParameters,
  traversePaths,
} from '@apipgen/swag-parser'

export interface PathsTransformOptions {
  configRead: ApiPipeline.ConfigRead
  interfaces: StatementInterface[]
  functions: StatementFunction[]
}

export function parser(configRead: ApiPipeline.ConfigRead) {
  const source = configRead.source as OpenAPISpecificationV2

  const comments = parseHeaderCommits(source)

  const interfaces: StatementInterface[] = []
  const functions: StatementFunction[] = []

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
    const { name, description, url, responseType } = parseMethodMetadata(config)

    interfaces.push(...attachInters)
    options.unshift('url')
    options.push(['...', 'config'])
    parameters.push({
      name: 'config',
      type: 'AxiosRequestConfig',
      required: false,
    })

    const { spliceTypeSpace } = transformParameters(parameters, {
      syntax: 'typescript',
      configRead,
      description,
      interfaces,
      responseType,
    })

    functions.push({
      export: true,
      name,
      description,
      parameters,
      body: [
        url.includes('$') ? `const url = \`${url}\`;` : `const url = "${url}"`,
        `return http.request<Response<${spliceTypeSpace(responseType)}>>({ ${literalFieldsToString(options)} })`,
      ],
    })
  })
}
