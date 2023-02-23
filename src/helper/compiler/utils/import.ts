import { factory } from 'typescript'

export function markImportDeclaration(from: string, input?: string, nameInputs?: string[]) {
  return factory.createImportDeclaration(
    undefined,
    factory.createImportClause(
      false,
      input ? factory.createIdentifier(input) : undefined,
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
    factory.createStringLiteral(from),
    undefined,
  )
}
