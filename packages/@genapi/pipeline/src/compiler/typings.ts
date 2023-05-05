import type { ApiPipeline } from '@genapi/config'
import { createComment, createInterface, createTypeAlias } from 'ts-factory-extra'
import { factory } from 'typescript'

export function compilerTsTypingsDeclaration(configRead: ApiPipeline.ConfigRead, comment = true) {
  configRead.graphs.comments = configRead.graphs.comments || []
  configRead.graphs.typings = configRead.graphs.typings || []
  configRead.graphs.interfaces = configRead.graphs.interfaces || []

  const typings = configRead.graphs.typings.map((item) => {
    return createTypeAlias(item.export, item.name, item.value)
  })
  const interfaces = configRead.graphs.interfaces.map((item) => {
    return createInterface({
      export: item.export,
      name: item.name,
      properties: item.properties || [],
    })
  })

  const nodes = [
    factory.createIdentifier(''),
    ...typings,
    factory.createIdentifier(''),
    ...interfaces,
  ]

  if (comment)
    nodes.unshift(createComment('multi', configRead.graphs.comments))

  return nodes as any[]
}
