import type ts from 'typescript'
import { factory } from 'typescript'
import type { ParserRequestOptions, ParserTypingsOptions } from '../typings/parser'
import { makeFunctionDeclaration } from './helper/ts-function'
import { handleRequestOptions } from './helper/ts-request'
import { makeInterfaceDeclaration } from './helper/ts-interface'
import { codeToAstNode, markComment, markImportDeclaration, markNamespaceImportDeclaration, markTypeAliasDeclaration, markVariableDeclarationConst } from './helper/ts-util'

export function createTSRequestDeclaration(o: ParserRequestOptions, t?: ParserTypingsOptions) {
  const jsonDocs = o.jsonDocs.map(item => markComment(item.comment, item.type))

  handleRequestOptions(o)

  const imports = [
    markImportDeclaration(o.httpImport.name, o.httpImport.value, o.httpImport.imports),
    o.typeImport && o.typeImport.value && markNamespaceImportDeclaration(o.typeImport.name, o.typeImport.value),
  ]

  const vars = [
    o.typeConfig && o.typeConfig.type && markTypeAliasDeclaration(o.typeConfig.name!, o.typeConfig.type!),
    o.baseURL && o.baseURL.value && markVariableDeclarationConst(o.baseURL.name!, o.baseURL.value),
  ]

  const functions = o.functions.flatMap(item => makeFunctionDeclaration(item as any))

  const nodes = [
    ...jsonDocs,
    factory.createIdentifier(''),
    ...imports,
    factory.createIdentifier(''),
    ...vars,
    factory.createIdentifier(''),
    ...functions,
  ].filter(Boolean) as ts.Node[]

  if (t) {
    const response = codeToAstNode(`export type Response<T> = ${t.responseType || 'T'}`)
    const typings = t.typings.map(v => makeInterfaceDeclaration(v))
    nodes.push(factory.createIdentifier(''))
    nodes.push(factory.createIdentifier(''))
    nodes.push(response)
    nodes.push(...typings)
  }

  return nodes
}
