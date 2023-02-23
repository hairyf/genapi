import camelCase from 'lodash/camelCase'
import forIn from 'lodash/forIn'
import type { ParserRequestOptions, ParserTypingsOptions } from '../typings/parser'
import type * as OpenAPITypes from '../typings/OpenAPI-Specification'
import type { OpenAPIBuildConfigurationRead } from '../typings/generator'
import { helperPropertie } from './helper/propertie'
import { helperParameter } from './helper/parameter'
import type { TraverseParametersOptions } from './helper/util'
import {
  createFunctionHelpers,
  createParametersHelpers,
  increaseState,
  isRequiredParameter,
  signAnyInter,
  traversePathParameters,
  varName,
} from './helper/util'

const FORM_DATA_FILED = { name: 'data', type: 'FormData', required: true }

class OpenAPI_JSONParserFactory {
  private $source: OpenAPITypes.OpenAPISourceV2Json
  private $options: OpenAPIBuildConfigurationRead
  private $parser!: {
    request: ParserRequestOptions
    typings: ParserTypingsOptions
  }

  public parser() {
    return this.$parser
  }

  constructor(data: OpenAPITypes.OpenAPISourceV2Json, options: OpenAPIBuildConfigurationRead) {
    this.$source = data
    this.$options = options
    this.transformAstOptions()
    this.transformPaths()
    this.transformDefinitions()
    this.transformNameSpace()
  }

  /** @转换Ast基础配置 */
  private transformAstOptions() {
    const data = this.$source
    const options = this.$options
    const jsonDocs: ParserRequestOptions['jsonDocs'] = [
      {
        type: 'multi',
        comment: [
          `@title ${data.info.title}`,
          `@description ${data.info.description}`,
          data.swagger && `@swagger ${data.swagger}`,
          `@version ${data.info.version}`,
        ].filter(Boolean),
      },
    ]
    const functions: ParserRequestOptions['functions'] = []
    const interfaces: ParserTypingsOptions['typings'] = []
    const request: ParserRequestOptions = {
      jsonDocs,
      baseURL: options.baseURL,
      typeConfig: options.typeConfig,
      typeImport: options.typeImport,
      httpImport: {
        name: options.httpImport?.name ?? 'http',
        value: options.httpImport?.value ?? 'axios',
        imports: ['AxiosRequestConfig'],
      },
      functions,
    }
    const typings: ParserTypingsOptions = {
      jsonDocs,
      typings: interfaces,
      responseType: options.responseType,
    }
    this.$parser = { request, typings }
  }

  /** @转换Paths */
  private transformPaths() {
    traversePathParameters(this.$source.paths, (config) => {
      const { method, path, options: meta } = config
      /**
       * 函数参数、函数配置
       */
      const { options, parameters } = this.helperCollect(config)
      /**
       * 函数注释
       */
      const jsonDocs = [
        meta.summary && `@summary ${meta.summary}`,
        meta.description && `@description ${meta.description}`,
        `@method ${method}`,
        meta.tags && `@tags ${meta.tags.join(' | ') || '-'}`,
        meta.consumes && `@consumes ${meta.consumes.join('; ') || '-'}`,
        // meta.produces && `@produces ${meta.produces.join('; ') || '-'}`
      ].filter(Boolean)
      /**
       * 函数名称
       */
      const name = camelCase(`${method}/${path}`)
      /**
       * 请求地址
       */
      const url = `\`${path.replace(/({)/g, '${paths?.')}\``
      /**
       * 响应参数
       */
      const responseType = meta.responses['200'] ? helperPropertie(meta.responses['200']) : 'void'

      this.$parser.request.functions.push({
        name,
        method,
        url,
        jsonDocs,
        options,
        parameters,
        responseType,
        meta,
      })
    })
  }

  /** @转换Definitions */
  private transformDefinitions() {
    forIn(this.$source.definitions, (definition, name) => {
      function typePropMap(item: OpenAPITypes.Schema, name: string) {
        item.required = definition?.required?.some(v => v === name)
        if (item.description)
          item.description = `@description ${item.description}`
        return {
          name,
          type: helperPropertie(item),
          description: item.description,
          required: item.required,
        }
      }
      this.$parser.typings.typings.push({
        name: varName(name),
        properties: Object.keys(definition.properties || {}).map(name =>
          typePropMap(definition.properties[name], name),
        ),
      })
    })
  }

  /** @转换Ast基础配置 */
  private transformNameSpace() {
    this.$parser.request.functions.forEach((item) => {
      item.parameters.forEach(item => (item.type = this.helperType(item.type)))
      item.responseType = this.helperType(item.responseType)
      item.responseType = this.helperTypeResponse(item.responseType)
    })
  }

  /** @收集Parameters */
  private helperCollect(config: TraverseParametersOptions) {
    const { options, path, method } = config
    const {
      typings: { typings },
    } = this.$parser
    config.parameters = config.parameters.filter((item) => {
      return !options.parameters?.some(v => v.name === item.name)
    })
    const parameters = [...config.parameters, ...(options.parameters || [])]
    const parametersHelpers = createParametersHelpers()
    const functionHelpers = createFunctionHelpers()
    for (const parameter of parameters) {
      const target = parametersHelpers[parameter.in]
      target.push(helperParameter(parameter))
    }
    forIn(parametersHelpers, (properties, paramType) => {
      if (properties.length === 0)
        return

      if (paramType === 'formData') {
        // TODO:fromData
        increaseState(functionHelpers, FORM_DATA_FILED)
        return
      }

      // body 是特殊的, 仅拿第一个
      if (paramType === 'body') {
        increaseState(functionHelpers, {
          required: properties[0].required,
          name: paramType,
          type: properties[0].type,
        })
        return
      }

      if (paramType === 'header')
        signAnyInter(properties)

      const typeName = varName([method, path, paramType])
      typings.push({ name: typeName, properties })
      increaseState(functionHelpers, {
        required: isRequiredParameter(properties),
        name: paramType,
        type: typeName,
      })
    })
    return functionHelpers
  }

  /** @处理Response类型 */
  private helperTypeResponse(name: string) {
    const NameSpace = this.$parser.request.typeImport?.name
    const isRenderType = this.$options.outputs?.some(v => v.type === 'typings')
    name = (NameSpace && isRenderType) ? `${NameSpace}.Response<${name}>` : `Response<${name}>`
    return name
  }

  /** @通用处理类型 */
  private helperType(name: string) {
    const NameSpace = this.$parser.request.typeImport?.name
    const isRenderType = this.$options.outputs?.some(v => v.type === 'typings')
    const isSome = this.$parser.typings.typings.map(item => item.name).includes(name.replace('[]', ''))
    if (NameSpace && isSome && isRenderType)
      name = `${NameSpace}.${name}`
    return name
  }
}

export function JSONParser(options: OpenAPIBuildConfigurationRead) {
  const parser = new OpenAPI_JSONParserFactory(options.source, options).parser()
  options.typings = parser.typings
  options.request = parser.request
  return options
}
