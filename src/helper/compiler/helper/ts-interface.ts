import { factory } from 'typescript'
import * as ts from 'typescript'
import type { InterfaceOptions } from '../../typings/parser'
import {
  markJSDocComment,
  markPropertySignature,
} from './ts-util'

export function makeInterfaceDeclaration(o: InterfaceOptions) {
  // 导出标识符
  const exportModifier = factory.createModifier(ts.SyntaxKind.ExportKeyword)
  // 方法名称
  const interfaceName = factory.createIdentifier(o.name)
  const properties: ts.PropertySignature[] = o.properties.flatMap((item) => {
    const commit = item.description && markJSDocComment(item.description)
    const property = markPropertySignature(item)
    if (commit) {
      (commit as any).name = property.name
      ;(commit as any).type = property.type
    }
    return [
      commit,
      property,
    ]
  })
    .filter(Boolean) as any

  return factory.createInterfaceDeclaration(
    undefined,
    [exportModifier],
    interfaceName,
    undefined,
    undefined,
    properties,
  )
}
