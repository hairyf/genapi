import { factory } from 'typescript'
import ts from 'typescript'
import type { InterfaceOptions } from '../../typings/parser'
import {
  markJSDocComment,
  markPropertySignature,
} from './ts-util'

patchInterfaceComment()

export function makeInterfaceDeclaration(o: InterfaceOptions) {
  // 导出标识符
  const exportModifier = factory.createModifier(ts.SyntaxKind.ExportKeyword)
  // 方法名称
  const interfaceName = factory.createIdentifier(o.name)
  const properties: ts.PropertySignature[] = o.properties.flatMap((item) => {
    return [
      item.description && markJSDocComment(item.description),
      markPropertySignature(item),
    ]
  })
    .filter(Boolean) as any

  return factory.createInterfaceDeclaration(
    [exportModifier],
    interfaceName,
    undefined,
    undefined,
    properties,
  )
}

function patchInterfaceComment() {
  const isTypeElement = ts.isTypeElement
  ts.isTypeElement = function(node): node is ts.TypeElement {
    return isTypeElement(node) || ts.isJSDoc(node) || ts.isIdentifier(node) 
  }
}