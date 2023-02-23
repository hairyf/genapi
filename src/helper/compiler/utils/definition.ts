import ts, { factory } from 'typescript'

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
