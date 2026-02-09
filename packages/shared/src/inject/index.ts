import type { ApiPipeline, StatementField, StatementFunction, StatementImported, StatementInterface, StatementTypeAlias, StatementVariable } from '../types'

/**
 * Context passed through pipeline steps (config, configRead, parser scopes).
 * Parser uses ApiPipeline.Block<T> for add(scope, item) / values(scope).
 * Named scope (e.g. `${method}/${path}`) 使用 parameters、options；provide(name, { responseType }) 使用 responseType。
 */
export interface Context {
  config?: ApiPipeline.Config
  configRead?: ApiPipeline.ConfigRead
  interfaces?: ApiPipeline.Block<StatementInterface>
  functions?: ApiPipeline.Block<StatementFunction>
  imports?: ApiPipeline.Block<StatementImported>
  variables?: ApiPipeline.Block<StatementVariable>
  typings?: ApiPipeline.Block<StatementTypeAlias>
  parameters?: StatementField[]
  /** Named scope: method config options (e.g. LiteralField[]) */
  options?: unknown[]
  responseType?: string
}

export const context: Record<string, Context> = {}

/**
 * Gets the current pipeline context for the given scope (default: `'default'`).
 * Type-safe: use inject<ParserContext>() in parser steps to get ParserContext without cast.
 *
 * @param scope - Context key
 * @returns Current context for that scope
 * @group Inject
 * @example
 * ```ts
 * const ctx = inject<ParserContext>()
 * ctx.functions.add('main', item)
 * ```
 */
export function inject<T = Context>(scope = 'default'): Required<T> {
  const currentContext = context[scope] || {}
  return currentContext as Required<T>
}

/**
 * Sets context for a scope.
 * @group Inject
 */
export function provide(value: Context): void
export function provide(scope: string, value: Context): void
export function provide(...args: [string, Context] | [Context]): void {
  if (args.length === 2) {
    context[args[0] as string] = args[1]
  }
  else {
    context.default = args[0] as Context
  }
}
