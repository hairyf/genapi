import type { StatementField } from '@genapi/config'
import type { LiteralField } from '../utils'

export interface HeadersTransformOptions {
  options: LiteralField[]
  parameters: StatementField[]
}

export function transformHeaderOptions(name: string, { parameters, options }: HeadersTransformOptions) {
  const applicationJSONFields = [
    '\'Content-Type\': \'application/json\'',
  ]
  const applicationDataFields = [
    '\'Content-Type\': \'multipart/form-data\'',
  ]
  const parameter = parameters.find(v => v.name === name)

  if (!parameter)
    return

  const headersOptionsIndex = options.findIndex(p => p === 'headers')

  if (headersOptionsIndex !== -1) {
    applicationDataFields.push('...headers')
    applicationJSONFields.push('...headers')
    options.splice(headersOptionsIndex, 1)
  }

  if (parameter?.type === 'FormData')
    options.unshift(['headers', `{ ${applicationDataFields} }`])
  else
    options.unshift(['headers', `{ ${applicationJSONFields} }`])
}
