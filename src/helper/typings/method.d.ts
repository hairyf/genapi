import { StatementFiled, LiteralFiled } from './filed'
export interface MethodFunctionOptions {
  /**
   * 方法名称
   */
  name: string
  /**
   * 调用名称
   */
  httpImport: { name: string }
  /**
   * 形参列表
   */
  parameters: StatementFiled[]
  /**
   * 配置列表
   */
  options: LiteralFiled[]
  /**
   * 函数调用 URL
   */
  url: string
  /**
   * 响应内容
   */
  responseType: string
  /**
   * jsonDocs
   */
  comment?: string[] | string
  /**
   * 请求方法
   */
  method: string

  /**
   * 元信息
   */
  meta?: any
}
