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
    const { parameters, interfaces: attachInters, options } = parseMethodParameters(config)
    let { name, description, url, responseType } = parseMethodMetadata(config)

    interfaces.push(...attachInters)
    parameters.push({
      name: 'config',
      type: 'OptionsOfTextResponseBody',
      required: false,
    })
    options.push(['...', 'config'])
    if (configRead.config.baseURL)
      options.unshift(['prefixUrl', 'baseURL'])

    for (const parameter of parameters) {
      if (parameter.type === 'FormData')
        parameter.type = 'any'
    }

    const { spaceResponseType } = transformParameters(parameters, {
      syntax: 'typescript',
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
        `const response = http.${config.method}(${url}, {
          ${literalFieldsToString(options)}
        })`,
        `return response.json<${spaceResponseType}>()`,
      ],
    })
  })
}
