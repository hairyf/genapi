import type { ApiPipeline, StatementFunction, StatementInterface } from 'apipgen'
import type { OpenAPISpecificationV2, Paths } from 'openapi-specification-types'
import {
  literalFieldsToString,
  parseHeaderCommits,
  parseMethodMetadata,
  parseMethodParameters,
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
    let { name, description, url, responseType, body } = parseMethodMetadata(config)

    interfaces.push(...attachInters)
    parameters.push({
      name: 'config',
      type: 'RequestInit',
      required: false,
    })
    options.push(['...', 'config'])

    const { spliceTypeSpace } = transformParameters(parameters, {
      syntax: 'typescript',
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
        `return response.json() as Promise<Response<${spliceTypeSpace(responseType)}>>`,
      ],
    })
  })
}
