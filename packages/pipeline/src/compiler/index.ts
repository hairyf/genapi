import type { ApiPipeline } from '@genapi/shared'
import { compilerTsRequestDeclaration } from './request'
import { compilerTsTypingsDeclaration } from './typings'

/**
 * Compiles graphs to AST: request code and typings for each output.
 *
 * @param configRead - ConfigRead with graphs and outputs
 * @returns Same configRead with output.ast set
 * @group Pipeline
 */
export function compiler(configRead: ApiPipeline.ConfigRead) {
  for (const output of configRead.outputs) {
    if (output.type === 'request' && !configRead.config.onlyDeclaration)
      output.ast = compilerTsRequestDeclaration(configRead)
    if (output.type === 'typings')
      output.ast = compilerTsTypingsDeclaration(configRead)
  }

  return configRead
}
