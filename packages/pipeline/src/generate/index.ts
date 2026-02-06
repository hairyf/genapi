import type { ApiPipeline } from '@genapi/shared'
import { format } from 'prettier'

/**
 * Formats code for each output with Prettier.
 *
 * @param configRead - ConfigRead with outputs[].code
 * @returns Same configRead with outputs[].code formatted
 * @group Pipeline
 */
export async function generate(configRead: ApiPipeline.ConfigRead, options?: any) {
  for (const output of configRead.outputs || []) {
    if (output.code)
      output.code = await formatTypescript(output.code, options)
  }
  return configRead
}

export async function formatTypescript(code: string, options?: any) {
  return await format(code, { printWidth: 800, ...options, parser: 'typescript' })
}
