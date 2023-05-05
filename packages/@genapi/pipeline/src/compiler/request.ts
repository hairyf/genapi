import type { ApiPipeline } from '@genapi/config'
import { NodeFlags, factory } from 'typescript'

import { codeToAstNode, createComment, createFunction, createImport, createVariable } from 'ts-factory-extra'
import { compilerTsTypingsDeclaration } from './typings'

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

  const isGenerateType = configRead.outputs.some(v => v.type === 'typings')
  const isTypescript = configRead.outputs.some(v => v.type === 'request' && v.path.endsWith('.ts'))

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
      async: item.async,
      returnType: item.returnType,
      generics: item.generics,
      generator: item.generator,
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

  if (!isGenerateType && isTypescript) {
    nodes.push(factory.createIdentifier(''))
    nodes.push(factory.createIdentifier(''))
    nodes.push(...compilerTsTypingsDeclaration(configRead, false))
  }

  return nodes
}
