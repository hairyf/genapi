import type { ApiPipeline } from 'apipgen'
import { NodeFlags, factory } from 'typescript'

import { codeToAstNode, createComment, createFunction, createImport, createVariable } from 'ts-factory-extra'

const varFlags = {
  let: NodeFlags.Let,
  const: NodeFlags.Const,
  var: NodeFlags.None,
}
// @ts-check
export function compilerTsRequestDeclaration(configRead: ApiPipeline.ConfigRead) {
  configRead.graphs.imports = configRead.graphs.imports || []
  configRead.graphs.comments = configRead.graphs.comments || []
  configRead.graphs.variables = configRead.graphs.variables || []
  configRead.graphs.functions = configRead.graphs.functions || []

  const comments = [
    createComment('multi', configRead.graphs.comments),
  ]
  const imports = configRead.graphs.imports?.map((item) => {
    return createImport(item.name, item.names, item.value, item.namespace)
  })
  const variables = configRead.graphs.variables.map((item) => {
    return createVariable(item.export, varFlags[item.flag], item.name, item.value)
  })
  const functions = configRead.graphs.functions.flatMap((item) => {
    return createFunction({
      export: true,
      comment: item.description,
      name: item.name,
      parameters: item.parameters,
      body: item.body?.map(codeToAstNode),
    })
  })

  const nodes = [
    ...comments,
    factory.createIdentifier(''),
    ...imports,
    factory.createIdentifier(''),
    ...variables,
    factory.createIdentifier(''),
    ...functions,
  ]

  return nodes
}
