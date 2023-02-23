import ts, { factory } from 'typescript'
import { createMultilineComment } from './comment'
import type { StatementInterface, StatementFiled } from './types'

patchInterfaceComment()

/**
 * create Interface
 * @example [o.export] interface [o.name] { [properties] }
 * @param o 
 * @returns 
 */
export function createInterface(o: StatementInterface) {
  const exportModifier = factory.createModifier(ts.SyntaxKind.ExportKeyword)
  const interfaceName = factory.createIdentifier(o.name)
  const properties: ts.PropertySignature[] = o.properties.flatMap((item) => {
    return [
      item.description && createMultilineComment(item.description),
      createInterfaceProperty(item),
    ]
  })
    .filter(Boolean) as any

  return factory.createInterfaceDeclaration(
    o.export === true ?  [exportModifier] : undefined,
    interfaceName,
    undefined,
    undefined,
    properties,
  )
}

/**
 * create Interface Property
 * @example [filed.name][filed.required]: [filed.type]
 * @example a?: string
 * @param filed
 * @returns 
 */
export function createInterfaceProperty(filed: StatementFiled) {
  return factory.createPropertySignature(
    undefined,
    factory.createIdentifier(filed.name),
    (typeof filed.required === 'undefined' || filed.required === false) ? factory.createToken(ts.SyntaxKind.QuestionToken) : undefined,
    filed.type ? factory.createTypeReferenceNode(filed.type) : undefined,
  )
}


function patchInterfaceComment() {
  const isTypeElement = ts.isTypeElement
  ts.isTypeElement = function(node): node is ts.TypeElement {
    return isTypeElement(node) || ts.isJSDoc(node) || ts.isIdentifier(node) 
  }
}
