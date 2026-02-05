import type { ApiPipeline, StatementFunction, StatementInterface } from '@genapi/shared'
import type { PathMethod } from './traverse'
import { inject, provide } from '@genapi/shared'
import { parseHeaderCommits, parseOpenapiSpecification } from './parses'
import { transformDefinitions } from './transform/definitions'
import { transformBaseURL } from './transform/urls'
import { traversePaths } from './traverse'

/**
 * Parser context injected by createParser for use in each preset's pathHandler.
 */
export interface ParserContext {
  configRead: ApiPipeline.ConfigRead
  functions: StatementFunction[]
  interfaces: StatementInterface[]
}

/**
 * Handler for a single path/method; each preset implements this to turn an OpenAPI operation into HTTP client code.
 */
export type PathHandler = (config: PathMethod, context: ParserContext) => void

/**
 * Creates a unified parser entry that reuses the common flow: parse spec → inject context → transform baseURL/definitions → traverse paths.
 * Presets only need to implement pathHandler, avoiding duplicated parser() and transformPaths boilerplate.
 *
 * @param pathHandler - Callback invoked per path in traversePaths
 * @returns parser(configRead) function conforming to the pipeline contract
 */
export function createParser(pathHandler: PathHandler) {
  return function parser(configRead: ApiPipeline.ConfigRead): ApiPipeline.ConfigRead {
    const source = parseOpenapiSpecification(configRead.source)
    const comments = parseHeaderCommits(source)
    const interfaces: StatementInterface[] = []
    const functions: StatementFunction[] = []

    // Inject interfaces, functions, and configRead into default context
    // Referenced at:
    // - packages/parser/src/parses/method.ts:95 (inject() gets interfaces, configRead)
    // - packages/parser/src/parses/schema.ts:24 (inject() gets interfaces, configRead)
    // - packages/parser/src/transform/definitions.ts:12 (inject() gets interfaces, configRead)
    // - packages/parser/src/create-parser.ts:43 (inject() gets interfaces, functions, configRead)
    provide({ interfaces, functions, configRead })
    transformBaseURL(source)
    if (source.definitions)
      transformDefinitions(source.definitions)

    traversePaths(source.paths ?? {}, (config) => {
      pathHandler(config, inject() as ParserContext)
    })

    configRead.graphs.comments = comments
    configRead.graphs.functions = functions
    configRead.graphs.interfaces = interfaces
    return configRead
  }
}
