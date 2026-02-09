import type { ApiPipeline, StatementField, StatementInterface } from '@genapi/shared'

/**
 * Options for parameter/response type transform (syntax, namespace, generic, infer).
 */
export interface ParameterTransformOptions {
  configRead: ApiPipeline.ConfigRead
  interfaces: StatementInterface[]
  description: string[]
  responseType: string
  syntax: 'typescript' | 'ecmascript'
  generic?: string
}

/**
 * Transforms parameter types and response type for target syntax (TypeScript vs ECMAScript JSDoc); mutates parameters and description.
 *
 * @param parameters - Statement fields for the operation (mutated: type spliced with namespace for ecmascript)
 * @param options - ConfigRead, interfaces, description array, responseType, syntax, optional generic
 * @returns Object with spaceResponseType (final response type string for codegen)
 * @example
 * ```ts
 * const { spaceResponseType } = transformParameters(parameters, { configRead, interfaces, description: [], responseType: 'User', syntax: 'typescript' })
 * ```
 */
export function transformParameters(parameters: StatementField[], options: ParameterTransformOptions) {
  const { configRead, syntax, interfaces, description, responseType } = options
  const importType = configRead.outputs.find(v => v.type === 'type')?.import
  const isGenerate = configRead.outputs.map(v => v.type).includes('type')
  const namespace = syntax === 'ecmascript' ? `import('${importType}')` : 'Types'
  const infer = configRead.graphs.response.infer || ''
  const generic = parseGenericType(configRead.graphs.response.generic || options.generic, syntax)

  const responseTypeSpliced = spliceTypeSpace(responseType)
  const responseTypePrefixed = isGenerate && namespace
    ? prefixTypeNamesInResponseType(responseTypeSpliced, namespace)
    : responseTypeSpliced

  const spaceResponseType = parseResponseType({
    responseType: responseTypePrefixed,
    generic,
    infer,
    namespace,
  })

  for (const parameter of parameters || []) {
    if (!parameter.type)
      continue
    parameter.type = spliceTypeSpace(parameter.type)

    if (syntax !== 'ecmascript')
      continue
    if (isGenerate)
      description.push(`@param {${parameter.type}${parameter.required ? '' : '='}} ${parameter.name}`)
    parameter.type = undefined
    parameter.required = true
  }

  if (isGenerate && syntax === 'ecmascript')
    description.push(`@return {${spaceResponseType}}`)

  function splitTypeSpaces(name: string) {
    const _name = name
      .replace(/[[\]()]/g, '')
      .split('|')
      .map(v => v.trim())
      .map(spliceTypeSpace)
      .join(' | ')
    if (name.includes('('))
      return `(${_name})`
    return _name
  }

  function spliceTypeSpace(name: string): string {
    if (name.includes('|') && !name.includes('[]'))
      return splitTypeSpaces(name)
    if (name.includes('|') && name.includes('[]'))
      return `${splitTypeSpaces(name)}[]`
    const isExists = interfaces.map(v => v.name).includes(name.replace('[]', ''))
    return (isGenerate && isExists) ? `${namespace}.${name}` : name
  }

  return { spaceResponseType }
}

/** 不应加 namespace 前缀的内置/关键字类型名 */
const BUILTIN_TYPE_NAMES = new Set([
  'Array',
  'Record',
  'Promise',
  'RequestInit',
  'FormData',
  'string',
  'number',
  'boolean',
  'any',
  'void',
  'null',
  'undefined',
  'object',
])

/**
 * 在 response 类型字符串中，为内联对象内的类型引用加上 namespace 前缀（如 Types.），
 * 使生成代码中的嵌套类型能正确引用 typings 中的类型。
 */
function prefixTypeNamesInResponseType(responseTypeStr: string, namespace: string): string {
  return responseTypeStr.replace(
    /(?<![.\w])([A-Z][a-zA-Z0-9]+)\b/g,
    (_, id: string) => (BUILTIN_TYPE_NAMES.has(id) || id === namespace) ? id : `${namespace}.${id}`,
  )
}

function parseGenericType(generic = '', syntax: 'typescript' | 'ecmascript') {
  if (!generic)
    generic = syntax === 'ecmascript' ? 'Promise<{__type__}>' : '{__type__}'
  return generic
}

function parseResponseType({ responseType = '', namespace = '', generic = '', infer = '' }) {
  if (infer)
    responseType = `${namespace}.Infer<${responseType}>`

  responseType = generic.replace('{__type__}', responseType)

  return responseType
}
