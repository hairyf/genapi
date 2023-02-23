import * as ts from 'typescript'
import { factory } from 'typescript'
import type { LiteralExpressionFiled, StatementFiled } from '../../typings/parser'

export function astNodeToCode(node: ts.Node | ts.Node[]) {
  if (!Array.isArray(node))
    node = [node]
  const resultFile = ts.createSourceFile('func.ts', '', ts.ScriptTarget.Latest, false, ts.ScriptKind.TS)
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed })
  return node
    .map(item => printer.printNode(ts.EmitHint.Unspecified, item, resultFile))
    .join('\n')
}
export function codeToAstNode(code: string) {
  const resultFile = ts.createSourceFile('func.ts', code, ts.ScriptTarget.Latest, false, ts.ScriptKind.TS)
  const node = (resultFile.getChildren()[0].parent as any).statements[0] as ts.TypeAliasDeclaration
  return node
}

export function markSingleLineComment(doc: string) {
  const typeDeclWithComment = ts.addSyntheticLeadingComment(
    factory.createIdentifier(''),
    ts.SyntaxKind.SingleLineCommentTrivia,
    ` ${doc}`,
    false,
  )
  return typeDeclWithComment
}
export function markJSDocComment(docs: string[] | string) {
  if (!Array.isArray(docs))
    docs = [docs]
  if (docs.length === 1) {
    const typeDeclWithComment = ts.addSyntheticLeadingComment(
      factory.createIdentifier(''),
      ts.SyntaxKind.MultiLineCommentTrivia,
      `* ${docs[0]} `,
      true,
    )
    return typeDeclWithComment as never
  }
  const comment = factory.createJSDocComment(
    docs.join('\n'),
    [],
  )
  return comment as never
}
export function markComment(docs: string[] | string, type: 'single' | 'docs') {
  if (type === 'single' && typeof docs === 'string')
    return markSingleLineComment(docs)
  else
    return markJSDocComment(docs)
}
export function markParameterDeclaration(o: StatementFiled) {
  return factory.createParameterDeclaration(
    undefined,
    undefined,
    factory.createIdentifier(o.name),
    (typeof o.required === 'undefined' || o.required === false) ? factory.createToken(ts.SyntaxKind.QuestionToken) : undefined,
    factory.createTypeReferenceNode(o.type),
  )
}
export function markPropertySignature(o: StatementFiled) {
  return factory.createPropertySignature(
    undefined,
    factory.createIdentifier(o.name),
    (typeof o.required === 'undefined' || o.required === false) ? factory.createToken(ts.SyntaxKind.QuestionToken) : undefined,
    factory.createTypeReferenceNode(o.type),
  )
}
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
export function markRequestCall(name: string, responseType: string, filed: LiteralExpressionFiled[]) {
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
          filed.map(markObjectLiteralExpression),
          false,
        ),
      ],
    ))
}
export function markImportDeclaration(name: string, value: string, nameInputs?: string[]) {
  return factory.createImportDeclaration(
    undefined,
    factory.createImportClause(
      false,
      factory.createIdentifier(name),
      nameInputs
        ? factory.createNamedImports(
          nameInputs.map(item => factory.createImportSpecifier(
            false,
            undefined,
            factory.createIdentifier(item),
          )),
        )
        : undefined,
    ),
    factory.createStringLiteral(value),
    undefined,
  )
}
export function markImportsDeclaration(imports: string[], value: string) {
  return factory.createImportDeclaration(
    undefined,
    factory.createImportClause(
      false,
      undefined,
      factory.createNamedImports(
        imports.map(item =>
          factory.createImportSpecifier(
            false,
            undefined,
            factory.createIdentifier(item),
          ),
        ),
      ),
    ),
    factory.createStringLiteral(value),
    undefined,
  )
}
export function markVariableDeclarationConst(name: string, value: string) {
  return factory.createVariableDeclarationList(
    [factory.createVariableDeclaration(
      factory.createIdentifier(name),
      undefined,
      undefined,
      factory.createIdentifier(value),
    )],
    ts.NodeFlags.Const,
  ) as any as ts.TypeAliasDeclaration
}
export function markTypeAliasDeclaration(name: string, value: string) {
  return factory.createTypeAliasDeclaration(
    undefined,
    factory.createIdentifier(name),
    undefined,
    factory.createIdentifier(value) as any,
  ) as any as ts.TypeAliasDeclaration
}
export function markNamespaceImportDeclaration(name: string, value: string) {
  return factory.createImportDeclaration(
    undefined,
    factory.createImportClause(
      false,
      undefined,
      factory.createNamespaceImport(factory.createIdentifier(name)),
    ),
    factory.createStringLiteral(value),
    undefined,
  ) as any as ts.TypeAliasDeclaration
}
export function markBlockTypeAliasAliasDeclaration(alias: StatementFiled[]) {
  const statements = alias
    .flatMap((item: any) => {
      if (item.required === true) {
        return [
          item.description && markJSDocComment(item.description),
          factory.createLabeledStatement(
            factory.createIdentifier(item.name),
            factory.createExpressionStatement(factory.createIdentifier(item.type)),
          ),
        ]
      }
      else {
        return [
          item.description && markJSDocComment(item.description),
          factory.createExpressionStatement(
            factory.createConditionalExpression(
              factory.createIdentifier(item.name),
              factory.createToken(ts.SyntaxKind.QuestionToken),
              factory.createIdentifier(''),
              factory.createToken(ts.SyntaxKind.ColonToken),
              factory.createIdentifier(item.type),
            ),
          ),
        ]
      }
    })
    .filter(Boolean) as ts.ExpressionStatement[] | ts.LabeledStatement[]
  return factory.createBlock(
    statements,
    true,
  )
}
