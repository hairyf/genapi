import type { StatementField } from 'apipgen'

/**
 * @example 'a' > { a }
 * @example ['a', 'b'] > { a: b }
 * @example ['...', 'c'] > { ...c }
 */
export type LiteralField = string | [string | '...', string]

/**
 * 对类型进行 any 签名
 * @param field
 */
export function signAnyInter(fields: StatementField[]) {
  fields.push({ name: '[key: string]', required: true, type: 'any' })
}

/**
 * 判断当前 parameters 是否存在必选
 * @param filed
 * @returns
 */
export function isRequiredParameter(fields: StatementField[]) {
  return fields.some(({ type, required, name }) => required && !name.startsWith('[') && !type?.endsWith('any'))
}

/**
 * 转换字面量字段
 * @param fields
 * @returns
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
