import type { ApiPipeline } from '@genapi/shared'
import { format } from 'prettier'

/**
 * Formats code for each output with Prettier.
 *
 * @param configRead - ConfigRead with outputs[].code
 * @returns Same configRead with outputs[].code formatted
 * @group Pipeline
 */
export function generate(configRead: ApiPipeline.ConfigRead) {
  for (const output of configRead.outputs || []) {
    if (output.code)
      output.code = formatTypescript(output.code)
  }
  return configRead
}

function formatTypescript(code: string) {
  return format(code, { printWidth: 800, parser: 'typescript' })
}
