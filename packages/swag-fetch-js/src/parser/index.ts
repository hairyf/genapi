/* eslint-disable no-template-curly-in-string */
import type { ApiPipeline, StatementFunction, StatementInterface } from 'apipgen'
import type { Definitions, OpenAPISpecificationV2, Paths, Schema } from 'openapi-specification-types'
import {
  literalFieldsToString,
  parseHeaderCommits,
  parseMethodMetadata,
  parseMethodParameters,
  parseSchemaType,
  traversePaths,
  varName,
} from '@apipgen/swag-parser'

export function parser(configRead: ApiPipeline.ConfigRead) {
  const source = configRead.source as OpenAPISpecificationV2

  const comments = parseHeaderCommits(source)

  const interfaces: StatementInterface[] = []
  const functions: StatementFunction[] = []

  defPuInterfaces(source.definitions, {
    configRead,
    functions,
    interfaces,
  })

  pathsPuFunctions(source.paths, {
    configRead,
    functions,
    interfaces,
  })

  configRead.graphs.comments = comments
  configRead.graphs.functions = functions
  configRead.graphs.interfaces = interfaces

  return configRead
}

interface TransformOptions {
  configRead: ApiPipeline.ConfigRead
  interfaces: StatementInterface[]
  functions: StatementFunction[]
}

function pathsPuFunctions(paths: Paths, { configRead, functions, interfaces }: TransformOptions) {
  traversePaths(paths, (config) => {
    /**
     * function params/function options/function use interfaces
     */
    const { parameters, interfaces: interfaceUses, options } = parseMethodParameters(config, {
      formData: 'body',
    })
    const typeOutput = configRead.outputs.find(v => v.type === 'typings')!
    const isGenerateType = configRead.config.output?.type !== false

    interfaces.push(...interfaceUses)

    let { name, description, url, responseType } = parseMethodMetadata(config)

    const body: string[] = []

    options.push(['...', 'config'])
    parameters.push({
      name: 'config',
      type: 'RequestInit',
      required: false,
    })

    for (const parameter of parameters || []) {
      if (parameter.type)
        parameter.type = spliceTypeSpace(parameter.type)
    }
    for (const parameter of parameters || []) {
      if (!parameter.type)
        continue
      parameter.type = spliceTypeSpace(parameter.type)
      if (isGenerateType)
        description.push(`@param {${parameter.type}${parameter.required ? '' : '='}} ${parameter.name}`)
      parameter.type = undefined
      parameter.required = true
    }
    if (isGenerateType) {
      const genericType = `import("${typeOutput?.import}").Response<${spliceTypeSpace(responseType)}>`
      description.push(`@return {${genericType}}`)
    }

    if (options.includes('query')) {
      options.splice(options.findIndex(v => v === 'query'), 1)
      body.push('const _querys_ = `?${new URLSearchParams(Object.entries(query)).toString()}`')
      url += '${_querys_}'
    }
    if (options.includes('body') && !parameters.find(v => v.type === 'FormData'))
      options.splice(options.findIndex(v => v === 'body'), 1, ['body', 'JSON.stringify(body || {})'])
    if (configRead.config.baseURL)
      url = `\${baseURL}${url}`

    url = url.includes('$') ? `\`${url}\`` : `'${url}'`

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

    function spliceTypeSpace(name: string) {
      const isGenerateType = configRead.config.output?.type !== false
      const isSomeType = interfaces.map(v => v.name).includes(name.replace('[]', ''))
      if (isGenerateType && isSomeType)
        return `import("${typeOutput.import}").${name}`
      return name
    }
  })
}

function defPuInterfaces(definitions: Definitions, { interfaces }: TransformOptions) {
  for (const [name, definition] of Object.entries(definitions)) {
    const { properties = {} } = definition

    interfaces.push({
      export: true,
      name: varName(name),
      properties: Object.keys(properties).map(name => defToFields(name, properties[name])),
    })

    function defToFields(name: string, propertie: Schema) {
      propertie.required = definition?.required?.some(v => v === name)
      if (propertie.description)
        propertie.description = `@description ${propertie.description}`
      return {
        name,
        type: parseSchemaType(propertie),
        description: propertie.description,
        required: propertie.required,
      }
    }
  }
}
