import ts, { factory } from 'typescript'

/**
 * create line comment
 * @param doc line text
 */
export function createSingleLineComment(doc: string) {
  const typeDeclWithComment = ts.addSyntheticLeadingComment(
    factory.createIdentifier(''),
    ts.SyntaxKind.SingleLineCommentTrivia,
    ` ${doc}`,
    false,
  )
  return typeDeclWithComment
}
/**
 * create Multi line comment
 * @param docs line text
 */
export function createMultilineComment(docs: string[] | string) {
  if (!Array.isArray(docs))
    docs = [docs]
  if (docs.length === 1) {
    const typeDeclWithComment = ts.addSyntheticLeadingComment(
      factory.createIdentifier(''),
      ts.SyntaxKind.MultiLineCommentTrivia,
      `* ${docs[0]} `,
      true,
    )
    return typeDeclWithComment as any as ts.JSDoc
  }
  const comment = factory.createJSDocComment(
    docs.join('\n'),
    [],
  )
  return comment
}

/**
 * create Single/Multi comment
 * @param type
 * @param docs
 */
export function createComment(type: 'single' | 'multi', docs: string[] | string) {
  if (type === 'single' && typeof docs === 'string')
    return createSingleLineComment(docs)
  else
    return createMultilineComment(docs)
}
