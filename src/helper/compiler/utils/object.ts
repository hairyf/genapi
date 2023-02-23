import { factory } from 'typescript'
import type { LiteralExpressionFiled } from './types'

export function markObjectLiteralExpression(filed: LiteralExpressionFiled) {
  if (typeof filed === 'string') {
    return factory.createShorthandPropertyAssignment(
      factory.createIdentifier(filed),
      undefined,
    )
  }
  else {
    if (filed[0] === '...') {
      return factory.createSpreadAssignment(factory.createIdentifier(filed[1]))
    }
    else {
      return factory.createPropertyAssignment(
        factory.createIdentifier(filed[0]),
        factory.createIdentifier(filed[1]),
      )
    }
  }
}
