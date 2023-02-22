import path from 'path'
import cloneDeep from 'lodash/cloneDeep'
import merge from 'lodash/merge'
import type { OpenAPIBuildConfiguration, OpenAPIBuildConfigurationRead } from '../typings/generator'
import { defaultConfig } from '../../config'
import type { BuildOutput } from '../typings/output'

export const parserTsConfig = (config: OpenAPIBuildConfiguration): OpenAPIBuildConfigurationRead => {
  config = merge(cloneDeep(defaultConfig), config)
  const outputs = helperOutput(config)
  const typings = outputs.find(i => i.type === 'typings')
  // TODO: 信息失真
  const options: OpenAPIBuildConfigurationRead = {
    baseURL: { value: config.baseURL || '' },
    typeConfig: {
      /**
       * 函数参数名称 (config)
       */
      parameter: 'config',
      /**
       * 类型名称 (config: AxiosRequestConfig)
       */
      name: 'AxiosRequestConfig',
    },
    typeImport: {
      /**
       * 解析的类型导入名称 import * as OpenAPITypes
       */
      name: 'OpenAPITypes',
      /**
       * 解析的类型导入地址 import * as OpenAPITypes "value"
       */
      value: typings?.import || '',
    },
    httpImport: {
      name: 'http',
      value: 'axios',
      imports: ['AxiosRequestConfig'],
    },
    // TODO: 通用的导入 import，会在 main 中定义
    // imports: [
    //   {
    //     name: 'http',
    //     value: 'axios',
    //     imports: [ 'AxiosRequestConfig' ]
    //   },
    //   {
    //     name: 'OpenAPITypes',
    //     value: typings?.import || ''
    //   }
    // ],
    // TODO: 通用的值定义，会在 main 中定义
    // vars: [],
    // TODO: 通用的类型定义，会在 main 中定义
    // types: [],
    // TODO: 通用的函数 parameter，会给每个函数都添加上
    // parameter: [],
    outputs,
    responseType: config.responseType,
    config,
  }
  return options
}

function helperOutput(config: OpenAPIBuildConfiguration): BuildOutput[] {
  const output = (function () {
    if (typeof config.output === 'string')
      return { main: config.output, cwd: '', type: '' }

    return config.output
  })()

  const basePath = output?.cwd || process.cwd()
  const api = output?.main || 'src/api/index.ts'
  let type = ''
  if (output?.type === true || typeof output?.type === 'undefined')
    type = api.replace(/\.ts|\.js/g, '.type.ts')
  if (typeof output?.type === 'string')
    type = output?.type

  const outputs: BuildOutput[] = []

  outputs.push({
    type: 'request',
    root: path.join(basePath, path.dirname(api)),
    import: api.replace(/\.ts$/, ''),
    path: path.join(basePath, api),
  })

  if (type) {
    let typeImport = path.relative(path.dirname(api), type).replace(/\.ts$/, '')
    typeImport = typeImport.startsWith('.') ? typeImport : `./${typeImport}`
    outputs.push({
      type: 'typings',
      root: path.join(basePath, path.dirname(type)),
      import: typeImport.replace(/\.ts$/, ''),
      path: path.join(basePath, type),
    })
  }

  return outputs
}
