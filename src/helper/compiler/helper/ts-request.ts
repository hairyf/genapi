import type { LiteralExpressionFiled, ParserRequestOptions, StatementFiled } from '../../typings/parser'

/**
 * 处理传入请求参数
 * @param httpImport 调用函数名称
 * @param typeConfig 添加 options / parameters
 * @param functions 添加 options / parameters
 * @param baseURL 添加 options
 */
export function handleRequestOptions({
  baseURL,
  typeConfig,
  functions,
  httpImport,
}: ParserRequestOptions) {
  const commons = {
    parameters: [] as StatementFiled[],
    before: [] as LiteralExpressionFiled[],
    after: [] as LiteralExpressionFiled[],
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
