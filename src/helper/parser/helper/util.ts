import forIn from 'lodash/forIn'
import { transliterate } from 'transliteration'
import { pascalCase } from 'pascal-case'
import type { LiteralFiled, StatementFiled } from '../../typings/parser'
import type * as OpenAPITypes from 'openapi-specification-types'

export interface TraverseParametersOptions {
  path: string
  parameters: OpenAPITypes.Parameter[]
  method: string
  options: OpenAPITypes.Method
}
export interface TraverseParametersCallback {
  (options: TraverseParametersOptions): void
}
/** api 导入 ts 类型集合的 命名空间名字 */
export const TS_TYPE_NAME_SPACE = 'OpenAPITypes'

/**
 * 遍历至 Parameters
 * @param paths
 * @param callback
 */
export function traversePathParameters(paths: OpenAPITypes.Paths, callback: TraverseParametersCallback) {
  for (const [path, _others] of Object.entries(paths)) {
    const { parameters = [], ...methods } = _others
    forIn(methods, (options, method) => {
      callback({
        path,
        method,
        options,
        parameters,
      })
    })
  }
}

/**
 * 过滤非英文字符
 * @param {*} str
 * @param {*} seat
 */
export function uselessString(string_: string) {
  return string_.replace(/[^\dA-Za-z]+/g, '')
}

/**
 * 获取可用变量名
 * @param {*} str
 */
export function varName(string_: string | string[]) {
  if (!string_) {
    // eslint-disable-next-line no-console
    console.trace('\n\nvarName inner is not defined\n')
    return string_
  }
  if (Array.isArray(string_))
    string_ = string_.filter(Boolean).join('/')

  string_ = pascalCase(string_)
  // 过一遍中文转拼音，没有中文转化之后无变化
  string_ = transliterate(string_ as string).replace(/\s+/g, '')
  // 过滤非英文字符
  string_ = uselessString(string_)
  // 转换为大驼峰
  string_ = pascalCase(string_)
  return string_ as string
}

/**
 * 是否存在于 definitions
 */
export function isExist(ds: OpenAPITypes.Definitions, name: string) {
  return !!ds[name]
}

/**
 * 取 ref map
 * @param ref
 * @returns
 */
export function useRefMap(ref: string) {
  return ref.split('/').pop()!
}

/**
 * 拼接 enum type
 * @param enums
 * @returns
 */
export function spliceEnumType(enums: string[] = []) {
  if (enums.length > 0)
    return `(${enums.map(v => `"${v}"`).join(' | ')})`

  return 'string'
}
/**
 * 破解 enum description
 * @param name
 * @param enums
 * @returns
 */
export function spliceEnumDescription(name: string, enums: string[] = []) {
  if (!enums?.length)
    return ''
  const em1 = `?${name}=${enums?.join(',') || 'a,b,c'}`
  const em2 = enums?.map(i => `${name}=${i}`).join('&') || `${name}=a&${name}=b`
  return `@param ${em1} | ${em2}`
}

/**
 * 添加函数参数（parameters/options），转换 name
 * @param options
 * @param filed
 * @returns
 */
export function increaseState(options: any, filed: StatementFiled) {
  if (options.options.includes(filed.name))
    return
  if (filed.name === 'body')
    filed.name = 'data'
  if (filed.name === 'query')
    filed.name = 'params'
  if (filed.name === 'path')
    filed.name = 'paths'
  if (filed.name === 'header')
    filed.name = 'headers'
  if (filed.name !== 'paths')
    options.options.push(filed.name)
  options.parameters.push(filed)
}
/**
 * 对类型进行 any 签名
 * @param filed
 */
export function signAnyInter(filed: StatementFiled[]) {
  filed.push({ name: '[key: string]', required: true, type: 'any' })
}
/**
 * 判断当前 parameters 是否存在必选
 * @param filed
 * @returns
 */
export function isRequiredParameter(filed: StatementFiled[]) {
  return filed.some(({ type, required, name }) => required && !name.startsWith('[') && !type?.endsWith('any'))
}

/**
 * 创建 ParametersHelpers
 */
export function createParametersHelpers() {
  return {
    header: [] as StatementFiled[],
    path: [] as StatementFiled[],
    query: [] as StatementFiled[],
    formData: [] as StatementFiled[],
    body: [] as StatementFiled[],
  }
}

export function createFunctionHelpers() {
  return {
    options: [] as LiteralFiled[],
    parameters: [] as StatementFiled[],
  }
}
