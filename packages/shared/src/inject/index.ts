import type { ApiPipeline, StatementField, StatementFunction, StatementInterface } from '../types'
/**
 * Context passed through pipeline steps (config, configRead, interfaces, functions, parameters).
 * @description Used by inject()/provide() to pass data between parser, compiler, and presets.
 * @example
 * ```ts
 * provide({ configRead, interfaces: [], functions: [] })
 * const ctx = inject()
 * ctx.configRead.outputs
 * ```
 */
export interface Context {
  config?: ApiPipeline.Config
  configRead?: ApiPipeline.ConfigRead
  interfaces?: StatementInterface[]
  functions?: StatementFunction[]
  parameters?: StatementField[]
  responseType?: string
}

export const context: Record<string, Context> = {
}

/**
 * Gets the current pipeline context for the given scope (default: `'default'`).
 * Used inside pipeline steps to read config/graphs.
 *
 * @param scope - Context key
 * @returns Current context for that scope
 * @group Inject
 * @example
 * ```ts
 * const { configRead, interfaces } = inject()
 * const config = inject('get/user/1')
 * ```
 */
export function inject(scope = 'default') {
  const currentContext = context[scope] || {}
  return currentContext as Required<Context>
}

/**
 * Sets context for a scope. Call with `(value)` for default scope or `(scope, value)` for a named scope.
 *
 * @group Inject
 * @example
 * ```ts
 * provide({ configRead, interfaces: [] })
 * provide('get/user', { parameters: [...] })
 * ```
 */
export function provide(value: Context): void
export function provide(scope: string, value: Context): void
export function provide(...args: [string, Context] | [Context]): void {
  const [scope, value] = args
  if (typeof scope === 'string') {
    context[scope] = context[scope] || {}
    Object.assign(context[scope], value)
  }
  else {
    context.default = context.default || {}
    Object.assign(context.default, scope)
  }
}
