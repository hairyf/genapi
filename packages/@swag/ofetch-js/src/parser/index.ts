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
  transformQueryParams,
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
      formData: 'body',
      query: 'params',
    })

    let { name, description, url, responseType, body } = parseMethodMetadata(config)

    interfaces.push(...attachInters)
    parameters.push({
      name: 'options',
      type: 'import(\'ofetch\').FetchOptions',
      required: false,
    })
    options.push(['...', 'options'])
    options.unshift(['method', `"${config.method}"`])
    if (configRead.config.baseURL)
      options.unshift('baseURL')

    transformParameters(parameters, {
      syntax: 'ecmascript',
      configRead,
      description,
      interfaces,
      responseType,
    })

    url = transformQueryParams('query', { body, options, url })
    url = transformUrlSyntax(url, { baseURL: configRead.config.baseURL })

    functions.push({
      export: true,
      async: true,
      name,
      description,
      parameters,
      body: [
        ...body,
        `return ofetch(${url}, {${literalFieldsToString(options)}})`,
      ],
    })
  })
}
