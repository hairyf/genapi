import { transliterate } from 'transliteration'
import { pascalCase } from 'pascal-case'

/**
 * Get available variable names
 * @param {*} str
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
  string_ = string_.replace(/[^\dA-Za-z]+/g, '')
  // 转换为大驼峰
  string_ = pascalCase(string_)
  return string_ as string
}

/**
 * ref map
 * @param ref
 * @returns
 */
export function useRefMap(ref: string) {
  return ref.split('/').pop()!
}

/**
 * splice enum description
 * @param name
 * @param enums
 * @returns
 */
export function spliceEnumDescription(name: string, enums: string[] = []) {
  if (!enums?.length)
    return ''
  const em1 = `${name} '${enums?.join(',') || 'a,b,c'}'`
  const em2 = enums?.map(i => `${name}=${i}`).join('&') || `${name}=a&${name}=b`
  return `@param ${em1} | '${em2}'`
}

/**
 * splice enum type
 * @param enums
 * @returns
 */
export function spliceEnumType(enums: string[] = []) {
  if (!enums.length)
    return ''
  let stringTypes = enums.map(v => `'${v}'`).join(' | ')
  stringTypes = stringTypes.includes('|') ? `(${stringTypes})` : stringTypes
  return `${stringTypes}[]`
}
