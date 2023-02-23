import ts from 'typescript'

/**
 * { ast object } > typescript string
 * @param node 
 */
export function astNodeToCode(node: ts.Node | ts.Node[]) {
  if (!Array.isArray(node))
    node = [node]
  const resultFile = ts.createSourceFile('func.ts', '', ts.ScriptTarget.Latest, false, ts.ScriptKind.TS)
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed })
  return node
    .map(item => printer.printNode(ts.EmitHint.Unspecified, item, resultFile))
    .join('\n')
}

/**
 * typescript string > { ast object }
 * @param code 
 */
export function codeToAstNode(code: string) {
  const resultFile = ts.createSourceFile('func.ts', code, ts.ScriptTarget.Latest, false, ts.ScriptKind.TS)
  const block = resultFile.getChildren()[0].parent as ts.Block
  return block.statements[0] as ts.TypeAliasDeclaration
}
