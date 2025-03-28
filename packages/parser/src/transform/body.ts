import type { StatementField } from '@genapi/shared'
import type { LiteralField } from '../utils'

export interface BodyJsonTransformOptions {
  options: LiteralField[]
  parameters: StatementField[]
}

export function transformBodyStringify(name: string, { options, parameters }: BodyJsonTransformOptions) {
  if (options.includes(name)) {
    const parameter = parameters.find(v => v.name === name)
    if (!parameter || parameter?.type === 'FormData' || parameter?.type === 'any')
      return
    const stringify = `JSON.stringify(${name}${parameter.required ? '' : ' || {}'})`
    options.splice(options.findIndex(v => v === name), 1, [name, stringify])
  }
}
