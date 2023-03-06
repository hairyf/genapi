import type { ApiPipeline, StatementFunction, StatementInterface } from 'apipgen'
import type { OpenAPISpecificationV2, Paths } from 'openapi-specification-types'
import {
  literalFieldsToString,
  parseHeaderCommits,
  parseMethodMetadata,
  parseMethodParameters,
  transformBaseURL,
  transformBodyStringify,
  transformDefinitions,
  transformParameters,
  transformQueryParams,
  transformUrlSyntax,
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
    const { parameters, interfaces: attachInters, options } = parseMethodParameters(config)
    let { name, description, url, responseType } = parseMethodMetadata(config)

    interfaces.push(...attachInters)
    parameters.push({
      name: 'config',
      type: 'Options',
      required: false,
    })
    options.push(['...', 'config'])
    if (configRead.config.baseURL)
      options.unshift(['prefixUrl', 'baseURL'])

    transformParameters(parameters, {
      syntax: 'ecmascript',
      configRead,
      description,
      interfaces,
      responseType,
    })
    transformBodyStringify('body', { options, parameters })
    transformQueryParams('query', { optionKey: 'searchParams', options })
    url = transformUrlSyntax(url)

    functions.push({
      export: true,
      async: true,
      name,
      description,
      parameters,
      body: [
        `const response = await http(${url}, {
          ${literalFieldsToString(options)}
        })`,
        'return response.json()',
      ],
    })
  })
}
