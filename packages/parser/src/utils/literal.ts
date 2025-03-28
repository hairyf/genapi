/**
 * @example 'a' > { a }
 * @example ['a', 'b'] > { a: b }
 * @example ['...', 'c'] > { ...c }
 */
export type LiteralField = string | [string | '...', string]

/**
 * Convert literal fields to string
 * @param fields
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
