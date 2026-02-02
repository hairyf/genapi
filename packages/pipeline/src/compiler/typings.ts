import type { ApiPipeline } from '@genapi/shared'
import { genComment, genInterface, genTypeAlias } from 'knitwork-x'

/**
 * Compiles configRead graphs to typings code string using knitwork-x.
 */
export function compilerTsTypingsDeclaration(configRead: ApiPipeline.ConfigRead, comment = true): string {
  configRead.graphs.comments = configRead.graphs.comments || []
  configRead.graphs.typings = configRead.graphs.typings || []
  configRead.graphs.interfaces = configRead.graphs.interfaces || []

  const sections: string[] = []

  if (comment && configRead.graphs.comments.length > 0) {
    sections.push(genComment(configRead.graphs.comments.join('\n'), { block: true }))
  }

  const typings = configRead.graphs.typings.map((item) => {
    return genTypeAlias(item.name, item.value, { export: !!item.export })
  })
  if (typings.length > 0)
    sections.push(typings.join('\n'))

  const interfaces = configRead.graphs.interfaces.map((item) => {
    const properties = (item.properties || []).map(p => ({
      name: p.name,
      type: p.type ?? 'any',
      optional: !p.required,
      jsdoc: p.description,
    }))
    return genInterface(item.name, properties, { export: !!item.export })
  })
  if (interfaces.length > 0)
    sections.push(interfaces.join('\n'))

  return sections.filter(Boolean).join('\n\n')
}
