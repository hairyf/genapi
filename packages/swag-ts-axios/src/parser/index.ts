import camelCase from 'lodash/camelCase'
import type { ApiPipeline, StatementFunction, StatementInterface, StatementTypeAlias } from 'apipgen'
import type { Definitions, OpenAPISpecificationV2, Paths, Schema } from 'openapi-specification-types'
import { getFunctionOptions, getPropertieType, traversePaths } from './utils'
import { varName } from './utils/format'
import { literalFieldsToString } from './utils/other'

export function parser(configRead: ApiPipeline.ConfigRead) {
  const source = configRead.source as OpenAPISpecificationV2

  const comments = [
    `@title ${source.info.title}`,
    `@description ${source.info.description}`,
    source.swagger && `@swagger ${source.swagger}`,
    `@version ${source.info.version}`,
  ]
  const typings: StatementTypeAlias[] = [
    { export: true, name: 'Response<T>', value: 'T' },
  ]
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
  configRead.graphs.typings = typings
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
    const { method, path, options: meta } = config
    /**
     * function params/function options/function use interfaces
     */
    const { parameters, interfaces: interfaceUses, options } = getFunctionOptions(config)

    interfaces.push(...interfaceUses)

    /**
     * function comments
     */
    const comments = [
      meta.summary && `@summary ${meta.summary}`,
      meta.description && `@description ${meta.description}`,
      `@method ${method}`,
      meta.tags && `@tags ${meta.tags.join(' | ') || '-'}`,
      meta.consumes && `@consumes ${meta.consumes.join('; ') || '-'}`,
    ]
    /**
     * function name
     */
    const name = camelCase(`${method}/${path}`)
    const url = `${path.replace(/({)/g, '${paths?.')}`

    /**
     * response type
     */
    const responseType = meta.responses['200'] ? getPropertieType(meta.responses['200']) : 'void'
    const genericType = `Response<${spliceTypeSpace(responseType)}>`

    function spliceTypeSpace(name: string) {
      const isGenerateType = configRead.config.output?.type !== false
      const isSomeType = interfaces.map(v => v.name).includes(name.replace('[]', ''))

      if (isGenerateType && isSomeType)
        return `OpenAPITypes.${name}`
      return name
    }

    for (const parameter of parameters || []) {
      if (parameter.type)
        parameter.type = spliceTypeSpace(parameter.type)
    }

    functions.push({
      export: true,
      name,
      description: comments.filter(Boolean),
      parameters,
      body: [
        url.includes('$') ? `const url = \`${url}\`;` : `const url = "${url}"`,
        `http.request<${genericType}>({ ${literalFieldsToString(options)} })`,
      ],
    })
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
        type: getPropertieType(propertie),
        description: propertie.description,
        required: propertie.required,
      }
    }
  }
}
