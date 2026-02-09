import type { ApiPipeline } from '@genapi/shared'
import { compile } from './scope'

/**
 * Compiles type scope to TypeScript typings. Delegates to compile(configRead, 'type').
 * @param configRead - ConfigRead with graphs.scopes and outputs
 * @param _comment - Ignored; type scope uses its own comments from graphs.scopes.type.comments
 */
export function compilerTsTypingsDeclaration(configRead: ApiPipeline.ConfigRead, _comment = true): string {
  return compile(configRead, 'type')
}
