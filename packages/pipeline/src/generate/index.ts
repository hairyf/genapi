import type { ApiPipeline } from '@genapi/shared'
import { format } from 'prettier'
import { astNodeToCode } from 'ts-factory-extra'

export function generate(configRead: ApiPipeline.ConfigRead) {
  for (const output of configRead.outputs || []) {
    if (output.ast)
      output.code = astNodeToCode(output.ast)
    if (output.code)
      output.code = formatTypescript(output.code)
  }
  return configRead
}

function formatTypescript(code: string) {
  return format(code, { printWidth: 800, parser: 'typescript' })
}
