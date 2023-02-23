import ts from 'typescript'
import { factory } from 'typescript'
import * as extra from './extra'
import type { ParserRequestOptions, ParserTypingsOptions } from '../typings/parser'
import { extendsRequestOptions } from './utils/ts-request'
import { createMethodFunction } from './utils/ts-function'

export function createTSRequestDeclaration(o: ParserRequestOptions, t?: ParserTypingsOptions) {
  const jsonDocs = o.jsonDocs.map(item => extra.createComment(item.type, item.comment))

  extendsRequestOptions(o)

  const imports = [
    extra.createImport(o.httpImport.name, o.httpImport.imports, o.httpImport.value),
    o.typeImport && o.typeImport.value && extra.createNamespaceImport(o.typeImport.name, o.typeImport.value),
  ]

  
  const vars = [
    o.typeConfig && o.typeConfig.type && extra.createTypeAlias(o.typeConfig.name!, o.typeConfig.type!),
    o.baseURL && o.baseURL.value && extra.createVariable(ts.NodeFlags.Const, o.baseURL.name!, o.baseURL.value),
  ]

  const functions = o.functions.flatMap(item => createMethodFunction(item as any))

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
    const response = extra.codeToAstNode(`export type Response<T> = ${t.responseType || 'T'}`)
    const typings = t.typings.map(v => extra.createInterface(v))
    nodes.push(factory.createIdentifier(''))
    nodes.push(factory.createIdentifier(''))
    nodes.push(response)
    nodes.push(...typings)
  }

  return nodes
}
