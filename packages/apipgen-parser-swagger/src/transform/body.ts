import type { StatementField } from 'apipgen'
import type { LiteralField } from '../utils'

export interface BodyJsonTransformOptions {
  options: LiteralField[]
  parameters: StatementField[]
}

export function transformBodyStringify(name: string, { options, parameters }: BodyJsonTransformOptions) {
  if (options.includes(name) && !parameters.find(v => v.type === 'FormData'))
    options.splice(options.findIndex(v => v === name), 1, [name, 'JSON.stringify(body || {})'])
}
