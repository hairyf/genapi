import { factory } from 'typescript'
import type { LiteralFiled } from './types'

/**
 * create Object Literal Filed
 * @example config, type: 'A', ...b
 * @param filed 
 */
export function createObjectLiteral(filed: LiteralFiled) {
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
