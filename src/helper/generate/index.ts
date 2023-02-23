import { format } from 'prettier'
import type { OpenAPIBuildConfigurationRead } from '../typings/generator'

import extra from 'ts-factory-extra'

export function generate(options: OpenAPIBuildConfigurationRead) {
  for (const output of options.outputs || []) {
    if (output.ast)
      output.code = extra.astNodeToCode(output.ast)
    if (output.code)
      output.code = formatTypescript(output.code)
  }
  return options
}

function formatTypescript(code: string) {
  return format(code, { printWidth: 800, parser: 'typescript' })
}
