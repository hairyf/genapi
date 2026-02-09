import type { StatementField } from '@genapi/shared'
import type { LiteralField } from '../utils'

/**
 * Options for body JSON stringify transform: option list and parameter list.
 */
export interface BodyJsonTransformOptions {
  options: LiteralField[]
  parameters: StatementField[]
}

/**
 * Replaces a body option with a JSON.stringify(...) literal when the parameter is not FormData/any.
 *
 * @param name - Parameter name (e.g. 'body')
 * @param options - Object with options and parameters arrays (mutated in place)
 * @param options.options - Literal field list
 * @param options.parameters - Statement fields for the operation
 * @example
 * ```ts
 * transformBodyStringify('body', { options: ['body', 'query'], parameters: [{ name: 'body', type: 'CreateDto' }] })
 * // options may become [['body', 'JSON.stringify(body || {})'], 'query']
 * ```
 */
export function transformBodyStringify(name: string, { options, parameters }: BodyJsonTransformOptions) {
  if (options.includes(name)) {
    const parameter = parameters.find(v => v.name === name)
    if (!parameter || parameter?.type === 'FormData' || parameter?.type === 'any')
      return
    const stringify = `JSON.stringify(${name}${parameter.required ? '' : ' || {}'})`
    options.splice(options.findIndex(v => v === name), 1, [name, stringify])
  }
}
