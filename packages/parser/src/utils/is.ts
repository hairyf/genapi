import type { StatementField } from '@genapi/shared'

/**
 * Determine if the current parameters are mandatory
 * @param fields
 */
export function isRequiredParameter(fields: StatementField[]) {
  return fields.some(({ type, required, name }) => required && !name.startsWith('[') && !type?.endsWith('any'))
}
