import { format } from 'prettier'
import type { OpenAPIBuildConfigurationRead } from '../typings/generator'
import { astNodeToCode } from '../compiler/helper/ts-util'

export function generate(options: OpenAPIBuildConfigurationRead) {
  for (const output of options.outputs || []) {
    if (output.ast)
      output.code = astNodeToCode(output.ast)
    if (output.code)
      output.code = formatTypescript(output.code)
  }
  return options
}

function formatTypescript(code: string) {
  return format(code, { printWidth: 800, parser: 'typescript' })
}
