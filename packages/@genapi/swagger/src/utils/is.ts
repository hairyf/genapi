import type { StatementField } from 'apipgen'

/**
  * 判断当前 parameters 是否存在必选
  * @param filed
  * @returns
  */
export function isRequiredParameter(fields: StatementField[]) {
  return fields.some(({ type, required, name }) => required && !name.startsWith('[') && !type?.endsWith('any'))
}
