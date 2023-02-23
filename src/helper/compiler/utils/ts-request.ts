import { factory } from 'typescript'
import type { LiteralFiled, ParserRequestOptions, StatementFiled } from '../../typings/parser'
import { createObjectLiteral } from '../extra'

/**
 * 处理传入请求参数
 * @param httpImport 调用函数名称
 * @param typeConfig 添加 options / parameters
 * @param functions 添加 options / parameters
 * @param baseURL 添加 options
 */
export function extendsRequestOptions({
  baseURL,
  typeConfig,
  functions,
  httpImport,
}: ParserRequestOptions) {
  const commons = {
    parameters: [] as StatementFiled[],
    before: [] as LiteralFiled[],
    after: [] as LiteralFiled[],
  }
  if (baseURL)
    baseURL.name = baseURL.name ?? 'baseURL'
  if (baseURL && baseURL.value)
    commons.before.unshift(baseURL.name!)
  if (typeConfig) {
    typeConfig.name = typeConfig.name ?? 'Config'
    typeConfig.parameter = typeConfig.parameter ?? 'config'
    commons.parameters.push({
      name: typeConfig.parameter,
      type: typeConfig.name,
      required: false,
    })
    commons.after.push(['...', typeConfig.parameter])
  }
  functions.forEach((item) => {
    (item as any).httpImport = httpImport
    item.parameters = [
      ...item.parameters,
      ...commons.parameters,
    ].sort(item => item.required ? -1 : 1)
    item.options = [
      ...commons.before,
      ...item.options,
      ...commons.after,
    ]
  })
}

/**
 * create Request Call
 * @example [name]<[responseType]>({ filed })
 * @param name 
 * @param responseType 
 * @param filed 
 * @returns 
 */
export function createRequest(name: string, responseType: string, filed: LiteralFiled[]) {
  return factory.createReturnStatement(
    factory.createCallExpression(
      factory.createPropertyAccessExpression(
        factory.createIdentifier(name),
        factory.createIdentifier('request'),
      ),
      [
        factory.createTypeReferenceNode(
          factory.createIdentifier(responseType),
          undefined,
        ),
      ],
      [
        factory.createObjectLiteralExpression(
          filed.map(createObjectLiteral),
          false,
        ),
      ],
    ))
}