import type { ApiPipeline, StatementField, StatementFunction, StatementInterface } from '../types'

export interface Context {
  config?: ApiPipeline.Config
  configRead?: ApiPipeline.ConfigRead
  interfaces?: StatementInterface[]
  functions?: StatementFunction[]
  parameters?: StatementField[]
}

export const context: Record<string, Context> = {
}

export function inject(scope = 'default') {
  const currentContext = context[scope] || {}
  return currentContext as Required<Context>
}

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
