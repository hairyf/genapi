import type { ApiPipeline, StatementField } from '@genapi/shared'
import type { Method, Parameter } from 'openapi-specification-types'

/**
 * Type guard: checks if the value is an inline parameter (has name and in), not a $ref.
 *
 * @param p - Parameter or $ref object
 * @returns true if p is a Parameter
 * @example
 * ```ts
 * if (isParameter(item)) { const { name, in: loc } = item }
 * ```
 */
export function isParameter(p: Parameter | { $ref?: string }): p is Parameter {
  return p != null && 'name' in p && 'in' in p
}

/**
 * Optional schema/option key names per parameter location (path, body, query, header, formData, cookie, querystring).
 */
export interface InSchemas {
  path?: string
  body?: string
  query?: string
  header?: string
  formData?: string
  cookie?: string
  querystring?: string
}

/**
 * Merges path-level parameters with operation-level parameters; operation params override by name.
 *
 * @param options - Operation object (method) with optional parameters
 * @param parameters - Path-level parameters
 * @returns Combined parameters array (path params first, then operation params replacing by name)
 * @example
 * ```ts
 * fillParameters(pathItem.get, pathParams) // [...pathParams, ...get.parameters] with dedup by name
 * ```
 */
export function fillParameters(options: Method, parameters: Parameter[]) {
  const opParams = (options.parameters ?? []).filter(isParameter)
  parameters = parameters.filter((item) => {
    return !opParams.some(v => v.name === item.name)
  })
  return [...parameters, ...opParams]
}

const IN_TYPE_TO_SCHEMA: Record<string, string> = {
  path: 'paths',
  body: 'body',
  query: 'query',
  header: 'headers',
  formData: 'body',
  cookie: 'headers',
  querystring: 'query',
}

/**
 * Resolves the option key for a parameter location (e.g. 'path' -> 'paths') from schemas or default map.
 *
 * @param inType - Parameter location (path, body, query, header, etc.)
 * @param schemas - Optional overrides per in type
 * @returns Option key string for codegen
 * @example
 * ```ts
 * toUndefField('query') // 'query'
 * toUndefField('body', { body: 'data' }) // 'data'
 * ```
 */
export function toUndefField(inType: Parameter['in'], schemas: InSchemas = {}) {
  const key = inType as keyof InSchemas
  return schemas[key] ?? IN_TYPE_TO_SCHEMA[inType] ?? 'query'
}

/**
 * Appends an index signature [key: string]: any to the fields array (for open object types).
 *
 * @param fields - Statement fields (mutated)
 * @example
 * ```ts
 * signAnyInter(headerFields) // headerFields now has [key: string]: any
 * ```
 */
export function signAnyInter(fields: StatementField[]) {
  fields.push({ name: '[key: string]', required: true, type: 'any' })
}

/**
 * Swaps file extension between .ts and .js in output path (e.g. for dual TS/JS presets).
 *
 * @param output - Output path string or { main, type }
 * @param ext - Target extension 'js' or 'ts'
 * @returns Path with extension replaced
 * @example
 * ```ts
 * replaceMainext('src/api/index.ts', 'js') // 'src/api/index.js'
 * ```
 */
export function replaceMainext(output?: ApiPipeline.PreOutput['output'], ext: 'js' | 'ts' = 'js') {
  const from = ext === 'js' ? 'ts' : 'js'
  const to = ext === 'js' ? ext : 'ts'
  if (typeof output === 'string')
    return output.replace(from, to)
  return output?.main?.replace(from, to)
}
