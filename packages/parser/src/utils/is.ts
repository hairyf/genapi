import type { StatementField } from '@genapi/shared'

/**
 * Returns whether any of the given fields are required (and not index signature / any).
 *
 * @param fields - Statement fields (parameters or interface properties)
 * @returns true if at least one required field exists
 * @example
 * ```ts
 * isRequiredParameter([{ name: 'id', required: true, type: 'string' }]) // true
 * isRequiredParameter([{ name: 'tag', required: false }]) // false
 * ```
 */
export function isRequiredParameter(fields: StatementField[]) {
  return fields.some(({ type, required, name }) => required && !name.startsWith('[') && !type?.endsWith('any'))
}
