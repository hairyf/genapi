import type { ApiPipeline } from '@genapi/shared'
import { compile } from './scope'

/**
 * Compiles each output from graphs.scopes[output.type]; onlyDeclaration 时仅编译 type 为 "type" 的 output。
 *
 * @param configRead - ConfigRead with graphs.scopes and outputs
 * @returns Same configRead with output.code set
 * @group Pipeline
 */
export function compiler(configRead: ApiPipeline.ConfigRead) {
  const onlyDeclaration = !!configRead.config.meta?.onlyDeclaration
  for (const output of configRead.outputs) {
    if (onlyDeclaration && output.type !== 'type')
      continue
    output.code = compile(configRead, output.type)
  }
  return configRead
}

export { compile } from './scope'
