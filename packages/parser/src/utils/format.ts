import { pascalCase } from 'scule'
import { transliterate } from 'transliteration'

/**
 * Converts a string or path segments into a valid PascalCase identifier (transliterates, strips non-alphanumeric).
 *
 * @param string_ - Single string or array of segments (e.g. path + method)
 * @returns PascalCase variable name safe for TypeScript
 * @example
 * ```ts
 * varName('get /user/info') // 'UserInfo'
 * varName(['get', 'user', 'id']) // 'UserId'
 * ```
 */
export function varName(string_: string | string[]) {
  if (!string_) {
    // eslint-disable-next-line no-console
    console.trace('\n\nvarName inner is not defined\n')
    return string_
  }
  if (Array.isArray(string_))
    string_ = string_.filter(Boolean).join('/')

  // 过一遍中文转拼音，没有中文转化之后无变化
  string_ = transliterate(string_ as string).replace(/\s+/g, '')
  // 转换为大驼峰
  string_ = pascalCase(string_)
  // 过滤非英文字符
  string_ = string_.replace(/[^\dA-Z]+/gi, '')
  // 转换为大驼峰
  string_ = pascalCase(string_)
  return string_ as string
}

/**
 * Extracts the last segment from a $ref path (e.g. '#/definitions/User' -> 'User').
 *
 * @param ref - OpenAPI $ref string
 * @returns Definition or schema name
 * @example
 * ```ts
 * useRefMap('#/definitions/UserDto') // 'UserDto'
 * ```
 */
export function useRefMap(ref: string) {
  return ref.split('/').pop()!
}

/**
 * Builds JSDoc @param line for an enum query parameter (allowed values and example query string).
 *
 * @param name - Parameter name
 * @param enums - Allowed enum values
 * @returns JSDoc string or empty string if no enums
 * @example
 * ```ts
 * spliceEnumDescription('status', ['a', 'b']) // "@param status 'a,b' | 'status=a&status=b'"
 * ```
 */
export function spliceEnumDescription(name: string, enums: string[] = []) {
  if (!enums?.length)
    return ''
  const em1 = `${name} '${enums?.join(',') || 'a,b,c'}'`
  const em2 = enums?.map(i => `${name}=${i}`).join('&') || `${name}=a&${name}=b`
  return `@param ${em1} | '${em2}'`
}

/**
 * Builds a TypeScript union array type from enum strings (e.g. 'a' | 'b' for array).
 *
 * @param enums - Enum string values
 * @returns Type string like "'a' | 'b'" or "('a' | 'b')[]", or ''
 * @example
 * ```ts
 * spliceEnumType(['draft', 'published']) // "('draft' | 'published')[]"
 * ```
 */
export function spliceEnumType(enums: string[] = []) {
  if (!enums.length)
    return ''
  let stringTypes = enums.map(v => `'${v}'`).join(' | ')
  stringTypes = stringTypes.includes('|') ? `(${stringTypes})` : stringTypes
  return `${stringTypes}[]`
}

/**
 * Escapes a property name for codegen: wraps in quotes if it contains non-identifier characters.
 *
 * @param name - Property or field name
 * @returns name or quoted name (e.g. 'data-id' -> "'data-id'")
 * @example
 * ```ts
 * varFiled('userId') // 'userId'
 * varFiled('data-id') // "'data-id'"
 * ```
 */
export function varFiled(name: string) {
  if (/[^A-Z]/i.test(name))
    name = `'${name}'`
  return name
}
