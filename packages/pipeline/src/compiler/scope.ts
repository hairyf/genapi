import type { ApiPipeline, StatementFunction, StatementInterface } from '@genapi/shared'
import { inject } from '@genapi/shared'
import { genComment, genFunction, genImport, genInterface, genTypeAlias, genVariable } from 'knitwork-x'

const RE_NAMESPACE = /^(Types\.|import\(['"][^'"]+['"]\)\.)/g
const RE_ARRAY_TYPE = /^(.+)\[\]$/

function generateMockTemplate(
  typeName: string,
  interfaceMap: Map<string, StatementInterface>,
  visited = new Set<string>(),
): string {
  const cleanTypeName = typeName.replace(RE_NAMESPACE, '').trim()
  const arrayMatch = cleanTypeName.match(RE_ARRAY_TYPE)
  if (arrayMatch) {
    const itemTemplate = generateMockTemplate(arrayMatch[1], interfaceMap, visited)
    return `[${itemTemplate}]`
  }
  const primitiveMap: Record<string, string> = {
    string: '\'@string\'',
    number: '\'@integer\'',
    boolean: '\'@boolean\'',
    Date: '\'@datetime\'',
    void: 'null',
    any: '\'@string\'',
  }
  if (primitiveMap[cleanTypeName])
    return primitiveMap[cleanTypeName]
  if (cleanTypeName.includes('|'))
    return '{}'
  const interfaceDef = interfaceMap.get(cleanTypeName)
  if (!interfaceDef?.properties || visited.has(cleanTypeName))
    return '{}'
  visited.add(cleanTypeName)
  const properties = interfaceDef.properties
    .filter(prop => prop.type)
    .map((prop) => {
      const propType = prop.type!.replace(RE_NAMESPACE, '').trim()
      const nextVisited = new Set(visited)
      if (propType.endsWith('[]')) {
        const itemTemplate = generateMockTemplate(propType.slice(0, -2), interfaceMap, nextVisited)
        return `'${prop.name}|1-5': ${itemTemplate}`
      }
      return `'${prop.name}': ${generateMockTemplate(propType, interfaceMap, nextVisited)}`
    })
  visited.delete(cleanTypeName)
  return properties.length > 0 ? `{\n    ${properties.join(',\n    ')}\n  }` : '{}'
}

export function genFunctionsWithMock(
  functions: StatementFunction[],
  interfaceMap: Map<string, StatementInterface>,
  config: ApiPipeline.Config,
): string[] {
  const functionBlocks: string[] = []
  for (const item of functions || []) {
    functionBlocks.push(genFunction({
      export: true,
      name: item.name,
      parameters: (item.parameters || []).map(p => ({ name: p.name, type: p.type, optional: !p.required })),
      body: item.body || [],
      async: item.async,
      returnType: item.returnType,
      generics: item.generics,
      jsdoc: item.description,
    }))
    const responseType = inject(item.name)?.responseType
    if (config.meta?.mockjs && responseType && responseType !== 'void' && responseType !== 'any') {
      const mockTemplate = generateMockTemplate(responseType, interfaceMap)
      functionBlocks.push(`${item.name}.mock = () => Mock.mock(${mockTemplate});`)
    }
  }
  return functionBlocks
}

function emptySlice(): ApiPipeline.GraphSlice {
  return {
    comments: [],
    functions: [],
    imports: [],
    variables: [],
    typings: [],
    interfaces: [],
  }
}

function varFiledToRaw(name: string): string {
  if (name.length >= 2 && name.startsWith('\'') && name.endsWith('\''))
    return name.slice(1, -1)
  return name
}

/**
 * 统一编译：按 scope 从 graphs.scopes[scope] 生成一段完整 TS 代码（comments → imports → variables → functions → typings → interfaces）。
 */
export function compile(configRead: ApiPipeline.ConfigRead, scope: string): string {
  const slice = configRead.graphs.scopes[scope] ?? emptySlice()
  const { config } = configRead
  const sections: string[] = []

  if (slice.comments?.length)
    sections.push(genComment(slice.comments.join('\n'), { block: true }))

  const importLines = (slice.imports || []).map((item) => {
    const isType = !!item.type
    if (item.namespace)
      return genImport(item.value, { name: '*', as: item.name! }, { type: isType })
    if (item.name && !item.names)
      return genImport(item.value, item.name, { type: isType })
    const names = item.names || []
    const imports = item.name ? [{ name: 'default', as: item.name }, ...names.map(n => ({ name: n }))] : names
    return genImport(item.value, imports, { type: isType })
  })
  if (config.meta?.mockjs)
    importLines.push(genImport('better-mock', { name: 'Mock' }))
  if (importLines.length)
    sections.push(importLines.join('\n'))

  const variables = (slice.variables || []).map(item =>
    genVariable(item.name, item.value ?? '', { export: !!item.export, kind: item.flag }),
  )
  if (variables.length)
    sections.push(variables.join('\n'))

  const interfaceMap = new Map<string, StatementInterface>(
    (slice.interfaces || []).map(i => [i.name, i]),
  )
  const functions = genFunctionsWithMock(slice.functions || [], interfaceMap, config)
  if (functions.length)
    sections.push(functions.join('\n\n'))

  const typings = (slice.typings || []).map(item =>
    genTypeAlias(item.name, item.value, { export: !!item.export }),
  )
  if (typings.length)
    sections.push(typings.join('\n'))

  const interfaces = (slice.interfaces || []).map((item) => {
    const properties = (item.properties || []).map(p => ({
      name: varFiledToRaw(p.name),
      type: p.type ?? 'any',
      optional: !p.required,
      jsdoc: p.description,
    }))
    return genInterface(item.name, properties, { export: !!item.export })
  })
  if (interfaces.length)
    sections.push(interfaces.join('\n'))

  return sections.filter(Boolean).join('\n\n')
}
