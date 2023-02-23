import ts, { factory } from 'typescript'

/**
 * create line comment
 * @param doc line text
 */
export function markSingleLineComment(doc: string) {
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
