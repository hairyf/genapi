/**
 * A single option for codegen: either a bare identifier or a [key, value] pair (or spread).
 * @example 'a' yields { a }; ['a', 'b'] yields { a: b }; ['...', 'c'] yields { ...c }
 */
export type LiteralField = string | [string | '...', string]

/**
 * Converts an array of LiteralField into a single comma-separated code string for object literals.
 *
 * @param fields - Array of literal fields (identifiers or [key, value] or spread)
 * @returns String like "method: 'GET', body: data" or "...headers"
 * @example
 * ```ts
 * literalFieldsToString([['method', "'GET'"], 'body']) // "method:'GET', body"
 * ```
 */
export function literalFieldsToString(fields: LiteralField[]) {
  function parse(field: LiteralField) {
    if (typeof field === 'string')
      return field
    if (field[0] === '...')
      return `...${field[1]}`
    return `${field[0]}:${field[1]}`
  }
  return fields.map(parse).join(', ')
}
