import type { ApiPipeline } from '@genapi/shared'
import { compilerTsRequestDeclaration } from './request'
import { compilerTsTypingsDeclaration } from './typings'

/**
 * Compiles graphs to code string: request and typings for each output.
 *
 * @param configRead - ConfigRead with graphs and outputs
 * @returns Same configRead with output.code set
 * @group Pipeline
 * @example
 * ```ts
 * compiler(configRead)
 * configRead.outputs.forEach(o => console.log(o.code))
 * ```
 */
export function compiler(configRead: ApiPipeline.ConfigRead) {
  for (const output of configRead.outputs) {
    if (output.type === 'request' && !configRead.config.meta?.onlyDeclaration)
      output.code = compilerTsRequestDeclaration(configRead)
    if (output.type === 'typings')
      output.code = compilerTsTypingsDeclaration(configRead)
  }

  return configRead
}

export { compilerTsRequestDeclaration, compilerTsTypingsDeclaration }
