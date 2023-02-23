import ts, { factory } from 'typescript'
import type { StatementFiled } from './types'

export function markPropertySignature(o: StatementFiled) {
  return factory.createPropertySignature(
    undefined,
    factory.createIdentifier(o.name),
    (typeof o.required === 'undefined' || o.required === false) ? factory.createToken(ts.SyntaxKind.QuestionToken) : undefined,
    factory.createTypeReferenceNode(o.type),
  )
}
