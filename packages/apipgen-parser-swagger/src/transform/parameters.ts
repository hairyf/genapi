import type { ApiPipeline, StatementField, StatementInterface } from 'apipgen'

export interface ParameterTransformOptions {
  configRead: ApiPipeline.ConfigRead
  interfaces: StatementInterface[]
  description: string[]
  responseType: string
  syntax: 'typescript' | 'ecmascript'
}
export function transformParameters(parameters: StatementField[], options: ParameterTransformOptions) {
  const { configRead, syntax, interfaces, description, responseType } = options
  const typeOutput = configRead.outputs.find(v => v.type === 'typings')!
  const isGenerateType = configRead.config.output?.type !== false
  const TypeNamespace = syntax === 'ecmascript' ? `import('${typeOutput?.import}')` : 'Types'
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

  if (isGenerateType && syntax === 'ecmascript')
    description.push(`@return {${spaceResponseType}}`)

  function spliceTypeSpace(name: string) {
    const someType = interfaces.map(v => v.name).includes(name.replace('[]', ''))
    if (isGenerateType && someType)
      return `${TypeNamespace}.${name}`
    return name
  }

  return { spaceResponseType }
}
