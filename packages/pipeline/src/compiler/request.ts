import type { ApiPipeline, StatementFunction, StatementInterface } from '@genapi/shared'
import { inject } from '@genapi/shared'
import { genComment, genFunction, genImport, genVariable } from 'knitwork-x'
import { compilerTsTypingsDeclaration } from './typings'

export function compilerTsRequestDeclaration(configRead: ApiPipeline.ConfigRead): string {
  const { graphs, config, outputs } = configRead
  const sections: string[] = []

  // 1. 预处理数据：建立 Map 索引提升递归查找性能
  const interfaceMap = new Map<string, StatementInterface>(
    (graphs.interfaces || []).map(i => [i.name, i]),
  )

  // 2. 注释生成
  if (graphs.comments?.length) {
    sections.push(genComment(graphs.comments.join('\n'), { block: true }))
  }

  // 3. 导入生成 (逻辑解耦)
  const importLines = (graphs.imports || []).map((item) => {
    const isType = !!item.type
    if (item.namespace)
      return genImport(item.value, { name: '*', as: item.name! }, { type: isType })
    if (item.name && !item.names)
      return genImport(item.value, item.name, { type: isType })

    const names = item.names || []
    const imports = item.name ? [{ name: 'default', as: item.name }, ...names.map(n => ({ name: n }))] : names
    return genImport(item.value, imports, { type: isType })
  })

  if (config.meta?.mockjs) {
    importLines.push(genImport('better-mock', { name: 'Mock' }))
  }
  if (importLines.length)
    sections.push(importLines.join('\n'))

  // 4. 变量生成
  const variables = (graphs.variables || []).map(item =>
    genVariable(item.name, item.value ?? '', { export: !!item.export, kind: item.flag }),
  )

  if (variables.length)
    sections.push(variables.join('\n'))

  // 5. 函数与 Mock 逻辑
  const functions = genFunctionsWithMock(graphs.functions || [], interfaceMap, config)

  if (functions.length)
    sections.push(functions.join('\n\n'))

  // 6. 内联类型声明
  const isGenerateType = outputs.some(v => v.type === 'typings')
  const isTsRequest = outputs.some(v => v.type === 'request' && v.path.endsWith('.ts'))
  if (!isGenerateType && isTsRequest) {
    sections.push(compilerTsTypingsDeclaration(configRead, false))
  }

  return sections.filter(Boolean).join('\n\n')
}

// 预编译正则，避免递归中重复创建
const RE_NAMESPACE = /^(Types\.|import\(['"][^'"]+['"]\)\.)/g
const RE_ARRAY_TYPE = /^(.+)\[\]$/

/**
 * 优化后的 Mock 模板生成函数
 */
function generateMockTemplate(
  typeName: string,
  interfaceMap: Map<string, StatementInterface>,
  visited = new Set<string>(),
): string {
  const cleanTypeName = typeName.replace(RE_NAMESPACE, '').trim()

  // 1. 处理数组
  const arrayMatch = cleanTypeName.match(RE_ARRAY_TYPE)
  if (arrayMatch) {
    const itemTemplate = generateMockTemplate(arrayMatch[1], interfaceMap, visited)
    return `[${itemTemplate}]`
  }

  // 2. 基础类型映射
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
    return '{}' // 联合类型暂简化处理

  // 3. 递归处理接口
  const interfaceDef = interfaceMap.get(cleanTypeName)
  if (!interfaceDef?.properties || visited.has(cleanTypeName)) {
    return '{}'
  }

  visited.add(cleanTypeName)

  const properties = interfaceDef.properties
    .filter(prop => prop.type)
    .map((prop) => {
      const propType = prop.type!.replace(RE_NAMESPACE, '').trim()

      // 这里的 visited 需要浅拷贝一份给子树，避免同级字段干扰，但保持父子链路
      const nextVisited = new Set(visited)

      if (propType.endsWith('[]')) {
        const itemType = propType.slice(0, -2)
        const itemTemplate = generateMockTemplate(itemType, interfaceMap, nextVisited)
        return `'${prop.name}|1-5': ${itemTemplate}`
      }

      const innerTemplate = generateMockTemplate(propType, interfaceMap, nextVisited)
      return `'${prop.name}': ${innerTemplate}`
    })

  visited.delete(cleanTypeName)

  return properties.length > 0
    ? `{\n    ${properties.join(',\n    ')}\n  }`
    : '{}'
}

export function genFunctionsWithMock(functions: StatementFunction[], interfaceMap: Map<string, StatementInterface>, config: ApiPipeline.Config) {
  const functionBlocks: string[] = [];
  (functions || []).forEach((item) => {
    // 生成函数主体
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
      jsdoc: item.description,
    })
    functionBlocks.push(functionCode)
    const responseType = inject(item.name)?.responseType

    // Mock 注入逻辑
    if (!config.meta?.mockjs || !responseType || responseType === 'void' || responseType === 'any') {
      return
    }
    const mockTemplate = generateMockTemplate(responseType, interfaceMap)
    functionBlocks.push(`${item.name}.mock = () => Mock.mock(${mockTemplate});`)
  })
  return functionBlocks
}
