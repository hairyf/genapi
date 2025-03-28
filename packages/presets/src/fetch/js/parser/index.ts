import type { ApiPipeline, StatementFunction, StatementInterface } from '@genapi/shared'
import type { Paths } from 'openapi-specification-types'
import {
  literalFieldsToString,
  parseHeaderCommits,
  parseMethodMetadata,
  parseMethodParameters,
  parseOpenapiSpecification,
  transformBaseURL,
  transformBodyStringify,
  transformDefinitions,
  transformHeaderOptions,
  transformParameters,
  transformQueryParams,
  transformUrlSyntax,
  traversePaths,
} from '@genapi/parser'

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
    })

    let { name, description, url, responseType, body } = parseMethodMetadata(config)

    interfaces.push(...attachInters)
    parameters.push({
      name: 'config',
      type: 'RequestInit',
      required: false,
    })

    if (config.method.toLowerCase() !== 'get')
      options.unshift(['method', `"${config.method}"`])

    transformHeaderOptions('body', { options, parameters })

    options.push(['...', 'config'])

    transformParameters(parameters, {
      syntax: 'ecmascript',
      configRead,
      description,
      interfaces,
      responseType,
    })

    transformBodyStringify('body', { options, parameters })

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
        `const response = await fetch(${url}, { 
          ${literalFieldsToString(options)} 
        })`,
        'return response.json()',
      ],
    })
  })
}
