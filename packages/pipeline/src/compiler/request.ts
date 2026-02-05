import type { ApiPipeline, StatementInterface } from '@genapi/shared'
import { inject } from '@genapi/shared'
import {
  genComment,
  genFunction,
  genImport,
  genVariable,
} from 'knitwork-x'

import { compilerTsTypingsDeclaration } from './typings'

/**
 * Generate mock template object based on interface definition
 */
function generateMockTemplate(
  typeName: string,
  interfaces: StatementInterface[],
  visited = new Set<string>(),
): string {
  // Remove namespace prefix like "Types." or "import('...')."
  const cleanTypeName = typeName
    .replace(/^Types\./, '')
    .replace(/^import\(['"][^'"]+['"]\)\./, '')
    .trim()

  // Handle array types like "Pet[]" or "string[]"
  const arrayMatch = cleanTypeName.match(/^(.+)\[\]$/)
  if (arrayMatch) {
    const itemType = arrayMatch[1]
    const itemTemplate = generateMockTemplate(itemType, interfaces, visited)
    return `[${itemTemplate}]`
  }

  // Handle union types (basic handling)
  if (cleanTypeName.includes('|')) {
    return '{}'
  }

  // Handle primitive types
  const primitiveMap: Record<string, string> = {
    string: '\'@string\'',
    number: '\'@integer\'',
    boolean: '\'@boolean\'',
    Date: '\'@datetime\'',
    void: 'null',
    any: '\'@string\'',
  }

  if (primitiveMap[cleanTypeName]) {
    return primitiveMap[cleanTypeName]
  }

  // Handle interface types
  const interfaceDef = interfaces.find(i => i.name === cleanTypeName)
  if (!interfaceDef || !interfaceDef.properties) {
    // If interface not found, return a basic object
    return '{}'
  }

  // Prevent circular references
  if (visited.has(cleanTypeName)) {
    return '{}'
  }
  visited.add(cleanTypeName)

  // Generate properties
  const properties: string[] = []
  for (const prop of interfaceDef.properties) {
    if (!prop.type)
      continue

    let propType = prop.type.trim()
    // Remove namespace prefix from property types
    propType = propType.replace(/^Types\./, '').replace(/^import\(['"][^'"]+['"]\)\./, '')

    let mockValue: string

    // Handle array types in properties
    if (propType.endsWith('[]')) {
      const itemType = propType.slice(0, -2)
      const itemTemplate = generateMockTemplate(itemType, interfaces, new Set(visited))
      mockValue = `'${prop.name}|1-5': ${itemTemplate}`
    }
    else {
      const innerTemplate = generateMockTemplate(propType, interfaces, new Set(visited))
      mockValue = `'${prop.name}': ${innerTemplate}`
    }

    properties.push(mockValue)
  }

  visited.delete(cleanTypeName)

  return properties.length > 0
    ? `{\n    ${properties.join(',\n    ')}\n  }`
    : '{}'
}

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

  // Add better-mock import if mockjs is enabled
  if (configRead.config.mockjs) {
    importLines.push(genImport('better-mock', { name: 'Mock' }))
  }

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
  const functionLines: string[] = []
  configRead.graphs.functions.forEach((item) => {
    const functionCode = genFunction({
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
    functionLines.push(functionCode)

    // Add .mock property if mockjs is enabled
    if (!configRead.config.mockjs)
      return
    const mockReturnType = inject(item.name)?.returnType || 'any'

    // For void return type, mock should return undefined
    if (mockReturnType === 'void')
      return
    let mockTemplate = '{}'
    if (mockReturnType && mockReturnType !== 'any') {
      // Generate structured mock template based on interface definition
      mockTemplate = generateMockTemplate(
        mockReturnType,
        configRead.graphs.interfaces || [],
      )
    }
    functionLines.push(`${item.name}.mock = () => { return Mock.mock(${mockTemplate}) }`)
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
