import { factory } from 'typescript'
import * as ts from 'typescript'
import type { MethodFunctionOptions } from '../../typings/parser'
import {
  codeToAstNode,
  markJSDocComment,
  markParameterDeclaration,
  markRequestCall,
} from './ts-util'

export function makeFunctionDeclaration(o: MethodFunctionOptions) {
  // 导出标识符
  const exportModifier = factory.createModifier(ts.SyntaxKind.ExportKeyword)
  // 方法名称
  const functionName = factory.createIdentifier(o.name)
  // 参数列表
  const parameters = o.parameters.map(markParameterDeclaration)
  const functionBlock = factory.createBlock([
    markConstUrl(o.url),
    markRequestCall(o.httpImport.name, o.responseType, ['url', ['method', `"${o.method}"`], ...o.options]),
  ], true)

  let comment
  if (o.jsonDocs?.length)
    comment = markJSDocComment(o.jsonDocs)

  const node = factory.createFunctionDeclaration(
    undefined,
    [exportModifier],
    undefined,
    functionName,
    undefined,
    parameters,
    undefined,
    functionBlock,
  )

  return [comment, node].filter(Boolean) as ts.FunctionDeclaration[]
}

function markConstUrl(value: string) {
  return codeToAstNode(`const url = ${value}`)
}
