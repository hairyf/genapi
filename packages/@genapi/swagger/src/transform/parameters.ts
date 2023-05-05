import type { ApiPipeline, StatementField, StatementInterface } from 'apipgen'

export interface ParameterTransformOptions {
  configRead: ApiPipeline.ConfigRead
  interfaces: StatementInterface[]
  description: string[]
  responseType: string
  syntax: 'typescript' | 'ecmascript'
  generic?: string
}
export function transformParameters(parameters: StatementField[], options: ParameterTransformOptions) {
  const { configRead, syntax, interfaces, description, responseType } = options
  const importType = configRead.outputs.find(v => v.type === 'typings')?.import
  const isGenerate = configRead.outputs.map(v => v.type).includes('typings')
  const namespace = syntax === 'ecmascript' ? `import('${importType}')` : 'Types'
  const infer = configRead.graphs.response.infer || ''
  const generic = parseGenericType(configRead.graphs.response.generic || options.generic, syntax)
  const spaceResponseType = parseResponseType({
    responseType: spliceTypeSpace(responseType),
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
      .replace(/[\[\]()]/g, '')
      .split('|')
      .map(v => v.trim())
      .map(spliceTypeSpace).join(' | ')
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
