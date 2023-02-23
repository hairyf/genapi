import { factory } from 'typescript'
import ts from 'typescript'

/**
 * create Import
 * @example import [namedInput], {[namedInputs]} from [value]
 * @example import http, { AxiosConfig } from 'axios'
 * @param namedInput 
 * @param namedInputs 
 * @param value 
 */
export function createImport(namedInput: string | undefined, namedInputs: string[] | undefined, value: string) {
  return factory.createImportDeclaration(
    undefined,
    factory.createImportClause(
      false,
      namedInput ? factory.createIdentifier(namedInput) : undefined,
      namedInputs
        ? factory.createNamedImports(
          namedInputs.map(item => factory.createImportSpecifier(
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

/**
 * create Namespace Import
 * @example import * as [namedInput] from [value]
 * @param namedInput 
 * @param value 
 */
export function createNamespaceImport(namedInput: string, value: string) {
  return factory.createImportDeclaration(
    undefined,
    factory.createImportClause(
      false,
      undefined,
      factory.createNamespaceImport(factory.createIdentifier(namedInput)),
    ),
    factory.createStringLiteral(value),
    undefined,
  ) as any as ts.TypeAliasDeclaration
}