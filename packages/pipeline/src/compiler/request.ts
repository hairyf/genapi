import type { ApiPipeline } from '@genapi/shared'
import {
  genComment,
  genFunction,
  genImport,
  genVariable,
} from 'knitwork-x'

import { compilerTsTypingsDeclaration } from './typings'

/**
 * Compiles configRead graphs to request code string using knitwork-x.
 */
export function compilerTsRequestDeclaration(configRead: ApiPipeline.ConfigRead): string {
  configRead.graphs.imports = configRead.graphs.imports || []
  configRead.graphs.comments = configRead.graphs.comments || []
  configRead.graphs.variables = configRead.graphs.variables || []
  configRead.graphs.functions = configRead.graphs.functions || []

  const isGenerateType = configRead.outputs.some(v => v.type === 'typings')
  const isTypescript = configRead.outputs.some(v => v.type === 'request' && v.path.endsWith('.ts'))

  const sections: string[] = []

  // Comments
  if (configRead.graphs.comments.length > 0) {
    sections.push(genComment(configRead.graphs.comments.join('\n'), { block: true }))
  }

  // Imports
  const importLines = configRead.graphs.imports.map((item) => {
    if (item.namespace)
      return genImport(item.value, { name: '*', as: item.name! }, { type: !!item.type })
    if (item.name && !item.names)
      return genImport(item.value, item.name, { type: !!item.type })
    if (item.name && item.names?.length) {
      const imports = [{ name: 'default', as: item.name }, ...item.names.map(n => ({ name: n }))]
      return genImport(item.value, imports, { type: !!item.type })
    }
    return genImport(item.value, item.names || [], { type: !!item.type })
  })
  if (importLines.length > 0)
    sections.push(importLines.join('\n'))

  // Variables
  const variableLines = configRead.graphs.variables.map((item) => {
    return genVariable(item.name, item.value ?? '', {
      export: !!item.export,
      kind: item.flag,
    })
  })
  if (variableLines.length > 0)
    sections.push(variableLines.join('\n'))

  // Functions
  const functionLines = configRead.graphs.functions.map((item) => {
    return genFunction({
      export: true,
      name: item.name,
      parameters: (item.parameters || []).map(p => ({
        name: p.name,
        type: p.type,
        optional: !p.required,
      })),
      body: item.body || [],
      async: item.async,
      returnType: item.returnType,
      generics: item.generics,
      generator: item.generator,
      jsdoc: item.description,
    })
  })
  if (functionLines.length > 0)
    sections.push(functionLines.join('\n\n'))

  // Inline typings for TS request files when not generating separate typings
  if (!isGenerateType && isTypescript) {
    sections.push('')
    sections.push(compilerTsTypingsDeclaration(configRead, false))
  }

  return sections.filter(Boolean).join('\n\n')
}
