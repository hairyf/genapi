import type { ApiPipeline, StatementField, StatementInterface } from 'apipgen'

export interface ParameterTransformOptions {
  configRead: ApiPipeline.ConfigRead
  interfaces: StatementInterface[]
  description: string[]
  responseType: string
  syntax: 'typescript' | 'ecmascript'
  returnType?: boolean
}
export function transformParameters(parameters: StatementField[], options: ParameterTransformOptions) {
  const { configRead, syntax, interfaces, description, responseType, returnType = true } = options
  const typeImport = configRead.outputs.find(v => v.type === 'typings')?.import
  const isGenerateType = configRead.outputs.map(v => v.type).includes('typings')
  const TypeNamespace = syntax === 'ecmascript' ? `import('${typeImport}')` : 'Types'
  const spaceResponseType = `${TypeNamespace}.Response<${spliceTypeSpace(responseType)}>`
  for (const parameter of parameters || []) {
    if (!parameter.type)
      continue
    parameter.type = spliceTypeSpace(parameter.type)

    if (syntax !== 'ecmascript')
      continue
    if (isGenerateType)
      description.push(`@param {${parameter.type}${parameter.required ? '' : '='}} ${parameter.name}`)
    parameter.type = undefined
    parameter.required = true
  }

  if (isGenerateType && syntax === 'ecmascript' && returnType)
    description.push(`@return {Promise<${spaceResponseType}>}`)

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
    const someType = interfaces.map(v => v.name).includes(name.replace('[]', ''))
    return (isGenerateType && someType) ? `${TypeNamespace}.${name}` : name
  }

  return { spaceResponseType }
}
