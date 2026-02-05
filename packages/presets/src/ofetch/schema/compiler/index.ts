import type { ApiPipeline } from '@genapi/shared'
import type { SchemaRoute } from '../parser'
import { compilerTsRequestDeclaration, compilerTsTypingsDeclaration } from '@genapi/pipeline'

const Endpoint = Symbol.for('Endpoint')
const DynamicParam = Symbol.for('DynamicParam')

interface SchemaNode {
  [key: string]: SchemaNode | {
    [Endpoint]?: Record<string, {
      query?: string
      body?: string
      headers?: string
      response: string
    }>
    [DynamicParam]?: SchemaNode
  }
}

// Basic types that should not be prefixed with Types.
const BASIC_TYPES = new Set(['string', 'number', 'boolean', 'void', 'any', 'unknown', 'null', 'undefined'])

/**
 * Convert type references to Types.* format
 * Examples:
 * - Pet -> Types.Pet
 * - Pet[] -> Types.Pet[]
 * - Record<string, Pet> -> Record<string, Types.Pet>
 */
function convertTypeToTypesNamespace(typeStr: string, interfaceNames: Set<string>): string {
  if (!typeStr || typeStr.trim() === '')
    return typeStr

  // Don't convert basic types
  if (BASIC_TYPES.has(typeStr.trim()))
    return typeStr

  // Handle array types: Pet[] -> Types.Pet[]
  const arrayMatch = typeStr.match(/^(.+?)\[\]$/)
  if (arrayMatch) {
    const baseType = arrayMatch[1].trim()
    if (interfaceNames.has(baseType))
      return `Types.${baseType}[]`
    // Recursively convert nested types in arrays
    return `${convertTypeToTypesNamespace(baseType, interfaceNames)}[]`
  }

  // Handle Record types: Record<string, Pet> -> Record<string, Types.Pet>
  const recordMatch = typeStr.match(/^Record<(.+)>$/)
  if (recordMatch) {
    const innerTypes = recordMatch[1]
    const convertedInner = innerTypes.split(',').map((t) => {
      const trimmed = t.trim()
      if (interfaceNames.has(trimmed))
        return `Types.${trimmed}`
      return convertTypeToTypesNamespace(trimmed, interfaceNames)
    }).join(', ')
    return `Record<${convertedInner}>`
  }

  // Handle union types: Pet | Order -> Types.Pet | Types.Order
  if (typeStr.includes('|')) {
    return typeStr.split('|').map((t) => {
      const trimmed = t.trim()
      if (interfaceNames.has(trimmed))
        return `Types.${trimmed}`
      return convertTypeToTypesNamespace(trimmed, interfaceNames)
    }).join(' | ')
  }

  // Handle intersection types: Pet & Order -> Types.Pet & Types.Order
  if (typeStr.includes('&')) {
    return typeStr.split('&').map((t) => {
      const trimmed = t.trim()
      if (interfaceNames.has(trimmed))
        return `Types.${trimmed}`
      return convertTypeToTypesNamespace(trimmed, interfaceNames)
    }).join(' & ')
  }

  // Handle generic types: Promise<Pet> -> Promise<Types.Pet>
  const genericMatch = typeStr.match(/^(\w+)<(.+)>$/)
  if (genericMatch) {
    const genericName = genericMatch[1]
    const innerTypes = genericMatch[2]
    const convertedInner = convertTypeToTypesNamespace(innerTypes, interfaceNames)
    return `${genericName}<${convertedInner}>`
  }

  // Handle inline object types: { name: string } - don't convert
  if (typeStr.trim().startsWith('{') && typeStr.trim().endsWith('}'))
    return typeStr

  // Simple type name - check if it's an interface
  const trimmed = typeStr.trim()
  if (interfaceNames.has(trimmed))
    return `Types.${trimmed}`

  return typeStr
}

function buildSchemaTree(routes: SchemaRoute[], interfaceNames: Set<string>): SchemaNode {
  const root: SchemaNode = {}

  for (const route of routes) {
    // Normalize path: remove leading slash and split
    const normalizedPath = route.path.startsWith('/') ? route.path.slice(1) : route.path
    const pathParts = normalizedPath ? normalizedPath.split('/') : []
    let current = root

    // Handle root path '/'
    if (pathParts.length === 0) {
      if (!current[Endpoint as any]) {
        current[Endpoint as any] = {}
      }
      const endpoint = current[Endpoint as any] as Record<string, any>
      const methodDef: Record<string, any> = {
        response: convertTypeToTypesNamespace(route.responseType, interfaceNames),
      }
      if (route.queryType)
        methodDef.query = convertTypeToTypesNamespace(route.queryType, interfaceNames)
      if (route.bodyType)
        methodDef.body = convertTypeToTypesNamespace(route.bodyType, interfaceNames)
      if (route.headersType)
        methodDef.headers = convertTypeToTypesNamespace(route.headersType, interfaceNames)
      endpoint[route.method] = methodDef
      continue
    }

    for (let i = 0; i < pathParts.length; i++) {
      const part = pathParts[i]
      const isParam = part.startsWith('{') && part.endsWith('}')

      if (isParam) {
        // Dynamic parameter
        if (!current[DynamicParam as any]) {
          current[DynamicParam as any] = {}
        }
        current = current[DynamicParam as any] as SchemaNode
      }
      else {
        // Static path segment
        if (!current[part]) {
          current[part] = {}
        }
        current = current[part] as SchemaNode
      }
    }

    // Add endpoint
    if (!current[Endpoint as any]) {
      current[Endpoint as any] = {}
    }
    const endpoint = current[Endpoint as any] as Record<string, any>
    const methodDef: Record<string, any> = {
      response: convertTypeToTypesNamespace(route.responseType, interfaceNames),
    }
    if (route.queryType)
      methodDef.query = convertTypeToTypesNamespace(route.queryType, interfaceNames)
    if (route.bodyType)
      methodDef.body = convertTypeToTypesNamespace(route.bodyType, interfaceNames)
    if (route.headersType)
      methodDef.headers = convertTypeToTypesNamespace(route.headersType, interfaceNames)
    endpoint[route.method] = methodDef
  }

  return root
}

function schemaNodeToTypeScript(node: SchemaNode, indent = 0, isRoot = false): string {
  const spaces = '  '.repeat(indent)
  const lines: string[] = []

  // Handle endpoint (for root path or nested paths)
  if (node[Endpoint as any]) {
    lines.push(`${spaces}[Endpoint]: {`)
    const endpoint = node[Endpoint as any] as Record<string, any>
    for (const [method, def] of Object.entries(endpoint)) {
      const methodLines: string[] = []
      methodLines.push(`${spaces}  ${method}: {`)
      if (def.query)
        methodLines.push(`${spaces}    query: ${def.query},`)
      if (def.body)
        methodLines.push(`${spaces}    body: ${def.body},`)
      if (def.headers)
        methodLines.push(`${spaces}    headers: ${def.headers},`)
      methodLines.push(`${spaces}    response: ${def.response},`)
      methodLines.push(`${spaces}  },`)
      lines.push(...methodLines)
    }
    lines.push(`${spaces}},`)
  }

  // Handle dynamic param
  if (node[DynamicParam as any]) {
    lines.push(`${spaces}[DynamicParam]: {`)
    lines.push(schemaNodeToTypeScript(node[DynamicParam as any] as SchemaNode, indent + 1))
    lines.push(`${spaces}},`)
  }

  // Handle static paths
  for (const [key, value] of Object.entries(node)) {
    if (key === Endpoint.toString() || key === DynamicParam.toString())
      continue

    // For root level, add leading slash
    const pathKey = isRoot ? `'/${key}'` : `'${key}'`
    lines.push(`${spaces}${pathKey}: {`)
    lines.push(schemaNodeToTypeScript(value as SchemaNode, indent + 1))
    lines.push(`${spaces}},`)
  }

  return lines.join('\n')
}

export function compiler(configRead: ApiPipeline.ConfigRead): ApiPipeline.ConfigRead {
  const routes = configRead.__schemaRoutes as SchemaRoute[] || []

  // Get all interface names for type conversion
  const interfaceNames = new Set<string>(
    (configRead.graphs.interfaces || []).map((i: { name: string }) => i.name),
  )
  // Also include typings that are type aliases (not inline types)
  const typings = configRead.graphs.typings || []
  for (const typing of typings) {
    if (typing.name && typeof typing.value === 'string' && !typing.value.includes('{')) {
      // Simple type alias, not inline type
      interfaceNames.add(typing.name)
    }
  }

  // Build schema tree
  const schemaTree = routes.length > 0 ? buildSchemaTree(routes, interfaceNames) : {}

  // Generate schema interface code
  const schemaCode = schemaNodeToTypeScript(schemaTree, 0, true)
  const schemaInterfaceContent = schemaCode.trim()

  // Generate $fetch function
  configRead.graphs.functions = [{
    export: true,
    name: '$fetch',
    generics: [{ name: 'T', extends: 'TypedFetchInput<APISchema>' }],
    parameters: [
      {
        name: 'input',
        type: 'T',
        required: true,
      },
      {
        name: 'init',
        type: 'TypedFetchRequestInit<APISchema, T>',
        required: false,
      },
    ],
    returnType: 'Promise<TypedResponse<TypedFetchResponseBody<APISchema, T>>>',
    async: true,
    body: [
      'return ofetch(input, init as RequestInit) as unknown as Promise<TypedResponse<TypedFetchResponseBody<APISchema, T>>>',
    ],
  }]

  // Generate code for each output
  for (const output of configRead.outputs) {
    if (output.type === 'request' && !configRead.config.onlyDeclaration) {
      // Generate code using standard compiler (imports are already configured in config)
      const requestCode = compilerTsRequestDeclaration(configRead)

      // Find where imports end and insert schema interface
      const lines = requestCode.split('\n')
      let lastImportIndex = -1
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim().startsWith('import'))
          lastImportIndex = i
      }

      // Insert schema interface after imports
      const schemaInterface = `// Define your API schema\ninterface APISchema {\n${schemaInterfaceContent}\n}\n\n`
      if (lastImportIndex >= 0) {
        const beforeSchema = lines.slice(0, lastImportIndex + 1).join('\n')
        const afterSchema = lines.slice(lastImportIndex + 1).join('\n')
        output.code = `${beforeSchema}\n${schemaInterface}${afterSchema}`
      }
      else {
        output.code = `${schemaInterface}${requestCode}`
      }
    }
    if (output.type === 'typings') {
      output.code = compilerTsTypingsDeclaration(configRead)
    }
  }

  return configRead
}
