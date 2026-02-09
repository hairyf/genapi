import type { ApiPipeline, StatementFunction, StatementImported, StatementInterface, StatementTypeAlias, StatementVariable } from '@genapi/shared'
import type { PathMethod } from './traverse'
import { inject, provide } from '@genapi/shared'
import { parseHeaderCommits, parseOpenapiSpecification } from './parses'
import { transformDefinitions } from './transform/definitions'
import { transformBaseURL } from './transform/urls'
import { traversePaths } from './traverse'

function block<T>(configRead: ApiPipeline.ConfigRead, key: keyof ApiPipeline.GraphSlice): ApiPipeline.Block<T> {
  return {
    add(scope, item) {
      let slice = configRead.graphs.scopes[scope]
      if (!slice) {
        slice = { comments: [], functions: [], imports: [], variables: [], typings: [], interfaces: [] }
        configRead.graphs.scopes[scope] = slice
      }
      if (Array.isArray(slice[key]))
        (slice[key] as T[]).push(item)
    },
    values(scope) {
      const slice = configRead.graphs.scopes[scope]
      return (slice && Array.isArray(slice[key]) ? slice[key] : []) as T[]
    },
    all() {
      return Object.values(configRead.graphs.scopes).flatMap(s => (s[key] || []) as T[])
    },
  }
}

/** Parser context: 仅 Block add/values，无 getAll。 */
export interface ParserContext {
  configRead: ApiPipeline.ConfigRead
  functions: ApiPipeline.Block<StatementFunction>
  interfaces: ApiPipeline.Block<StatementInterface>
  imports: ApiPipeline.Block<StatementImported>
  variables: ApiPipeline.Block<StatementVariable>
  typings: ApiPipeline.Block<StatementTypeAlias>
}

/**
 * Handler for a single path/method; each preset implements this to turn an OpenAPI operation into HTTP client code.
 * @description Callback invoked for each (path, method). Use ctx.*.add(scope, item) to collect per-output-type.
 * @example
 * ```ts
 * const pathHandler: PathHandler = (config, ctx) => {
 *   const { name } = parseMethodMetadata(config)
 *   ctx.functions.add('main', { name, parameters: [], body: [] })
 * }
 * ```
 */
export type PathHandler = (config: PathMethod, context: ParserContext) => void

/**
 * Creates a unified parser entry that reuses the common flow: parse spec → inject context → transform baseURL/definitions → traverse paths.
 * Presets use ctx.*.add(scope, item) only; no push or flat arrays.
 *
 * @param pathHandler - Callback invoked per path in traversePaths
 * @returns parser(configRead) function conforming to the pipeline contract
 */
export function createParser(pathHandler: PathHandler) {
  return function parser(configRead: ApiPipeline.ConfigRead): ApiPipeline.ConfigRead {
    const source = parseOpenapiSpecification(configRead.source)
    const comments = parseHeaderCommits(source)

    const ctx: ParserContext = {
      configRead,
      functions: block(configRead, 'functions'),
      interfaces: block(configRead, 'interfaces'),
      imports: block(configRead, 'imports'),
      variables: block(configRead, 'variables'),
      typings: block(configRead, 'typings'),
    }
    provide(ctx)
    transformBaseURL(source)
    if (source.definitions)
      transformDefinitions(source.definitions)

    traversePaths(source.paths ?? {}, config => pathHandler(config, inject<ParserContext>()))

    if (configRead.graphs.scopes.main)
      configRead.graphs.scopes.main.comments = comments
    return configRead
  }
}
