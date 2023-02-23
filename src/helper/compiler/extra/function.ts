import ts, { factory } from 'typescript'
import type { StatementFunction, StatementFiled } from './types'
import {createMultilineComment} from './comment'

/**
 * create Function
 * @example [o.export] function [o.name] ([o.parameters]) { [o.body] }
 * @param o 
 * @returns 
 */
export function createFunction(o: StatementFunction) {
  const exportModifier = factory.createModifier(ts.SyntaxKind.ExportKeyword)
  const functionName = factory.createIdentifier(o.name)
  const parameters = o.parameters?.map(createParameter) || []
  let comment
  
  const functionNode = factory.createFunctionDeclaration(
    [exportModifier],
    undefined,
    functionName,
    undefined,
    parameters,
    undefined,
    o.body ? factory.createBlock(o.body, true) : undefined
  )

  if (o.comment?.length)
    comment = createMultilineComment(o.comment)
  return [comment, functionNode].filter(Boolean) as ts.FunctionDeclaration[]
}

/**
 * create Function Parameter
 * @example function name([o.name]:[o.type])
 * @param o
 * @returns 
 */
export function createParameter(o: StatementFiled) {
  return factory.createParameterDeclaration(
    undefined,
    undefined,
    factory.createIdentifier(o.name),
    (typeof o.required === 'undefined' || o.required === false) ? factory.createToken(ts.SyntaxKind.QuestionToken) : undefined,
    o.type ? factory.createTypeReferenceNode(o.type) : undefined,
  )
}
