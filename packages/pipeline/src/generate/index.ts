import type { ApiPipeline } from '@genapi/shared'
import { format } from 'prettier'

/**
 * Formats code for each output with Prettier.
 *
 * @param configRead - ConfigRead with outputs[].code
 * @returns Same configRead with outputs[].code formatted
 * @group Pipeline
 * @example
 * ```ts
 * await generate(configRead)
 * await generate(configRead, { printWidth: 100 })
 * ```
 */
export async function generate(configRead: ApiPipeline.ConfigRead, options?: any) {
  for (const output of configRead.outputs || []) {
    if (output.code)
      output.code = await formatTypescript(output.code, options)
  }
  return configRead
}

/**
 * Formats TypeScript/JavaScript code string with Prettier.
 *
 * @param code - Source code to format
 * @param options - Prettier options (merged with parser: 'typescript', printWidth: 800)
 * @returns Formatted code string
 * @example
 * ```ts
 * const formatted = await formatTypescript('const x=1')
 * ```
 */
export async function formatTypescript(code: string, options?: any) {
  return await format(code, { printWidth: 800, ...options, parser: 'typescript' })
}
