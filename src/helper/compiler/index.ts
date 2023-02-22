import type { OpenAPIBuildConfigurationRead } from '../typings/generator'
import { createTSRequestDeclaration } from './ts-request'
import { createTSTypingsDeclaration } from './ts-typings'
import 'typescript'

export function tsCompiler(options: OpenAPIBuildConfigurationRead) {
  const isRenderType = options.outputs?.some(v => v.type === 'typings')
  for (const output of options.outputs || []) {
    if (output.type === 'request' && options.request) {
      if (!isRenderType)
        output.ast = createTSRequestDeclaration(options.request, options.typings)
      else
        output.ast = createTSRequestDeclaration(options.request)
    }
    if (output.type === 'typings' && options.typings)
      output.ast = createTSTypingsDeclaration(options.typings)
  }
  return options
}
