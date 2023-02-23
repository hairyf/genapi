import { AxiosRequestConfig } from 'axios'
import { ParserRequestOptions, ParserTypingsOptions } from './parser'
import { BuildOutput } from './output'
import { StatementFiled, StatementImported, StatementVariable } from '../compiler/extra/types'
import ts from 'typescript'

export interface OpenAPIBuildConfiguration {
  /** @description 传入字符串则解析为地址 */
  input:
  | {
    /** @description 渠道一: 当前 OpenAPI 服务器配置地址 当前服务器配置地址 http:/.../api-docs */
    uri?: string
    /** @description 渠道二: 数据源  */
    json?: any
    /** @description 渠道三: 测试数据  */
    test?: any
  }
  | string

  /** @description 当前接口基础地址, 一般可用于环境变量的定义 */
  baseURL?: string
  /**
   * @description 输出路径配置, 暂时只支持 ts 路径
   * @description 传入字符串则解析为 Api
   */
  output?:
  | {
    /** @default 'src/api/index.ts' */
    main?: string
    /** @default 'src/api/index.type.ts' */
    type?: string | boolean
    /** Node.js 进程的当前工作目录。 */
    cwd?: string
  }
  | string
  /** @description 生成文件的导入类型 */
  import?: {
    /** @description 导入请求函数的默认别名地址 @default axios; */
    http?: string
    /** @description 导入 types 生成类型的别名地址 @default output.type; */
    type?: string
  }
  /**
   * @description 响应体的类型转换
   * @default T >>> type Response<T> = T >>> http.get<Response<Data>>({...})
   * @template `T extends { data?: infer V } ? V : void`
   */
  responseType?: string
  /** @description 强制参数可选 */
  paramsPartial?: boolean
  /** OpenAPI 携带请求参数 */
  config?: AxiosRequestConfig
}

export interface OpenAPIBuildConfigurationRead {
  config: OpenAPIBuildConfiguration
  baseURL?: ParserRequestOptions['baseURL']
  typeConfig?: ParserRequestOptions['typeConfig']
  httpImport?: ParserRequestOptions['httpImport']
  typeImport?: ParserRequestOptions['typeImport']
  responseType?: string
  outputs?: BuildOutput[]
  request?: ParserRequestOptions
  typings?: ParserTypingsOptions
  source?: any
}

export interface OpenAPIBuildFunction {
  /**
    * all request function parameters
    */
  parameters?: StatementFiled[]
  /**
   * all request function body
   */
  body?: ts.Statement[]
}

export interface OpenAPIBuildConfigurationReadV2 {
  /**
   * config parser source
   */
  config: OpenAPIBuildConfiguration
  /**
   * all api options
   */
  function?: OpenAPIBuildFunction
  /**
   * all request imports
   */
  imports?: StatementImported[]

  /**
   * all request variables
   */
  variables?: StatementVariable[]

  /**
   * all request typeAlias
   */
  typeAlias?: []
}

export interface OpenAPIBuildConfigurationServers extends Omit<OpenAPIBuildConfiguration, 'input'> {
  server: OpenAPIBuildConfiguration | OpenAPIBuildConfiguration[]
}
export type OpenAPIDefineConfig = OpenAPIBuildConfigurationServers | OpenAPIBuildConfiguration
