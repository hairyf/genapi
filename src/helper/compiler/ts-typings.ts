import { factory } from 'typescript'
import type { ParserTypingsOptions } from '../typings/parser'
import * as extra from './extra'

export function createTSTypingsDeclaration(o: ParserTypingsOptions) {
  const comment = o.comment.map(item => extra.createComment(item.type, item.comment))
  const response = extra.codeToAstNode(`export type Response<T> = ${o.responseType || 'T'}`)
  const typings = o.typings.map(v => extra.createInterface(v))
  return [
    ...comment,
    factory.createIdentifier(''),
    response,
    factory.createIdentifier(''),
    ...typings,
  ]
}
