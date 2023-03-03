export interface StatementGeneric {
  name: string
  extends?: string
  default?: string
}
export interface StatementFunction {
  /**
   * function name
   */
  name: string
  /**
   * function params
   */
  parameters?: StatementField[]
  /**
   * function block
   */
  body?: string[]
  /**
   * is export
   */
  export?: boolean
  /**
   * is async
   */
  async?: boolean

  generator?: boolean

  /**
   * function description
   */
  description?: string | string[]

  returnType?: string

  generics?: StatementGeneric[]
}

export interface StatementInterface {
  /**
   * interface name
   */
  name: string
  /**
   * all properties
   */
  properties?: StatementField[]
  /**
   * is export
   */
  export?: boolean
}

export interface StatementField {
  /**
   * field name
   */
  name: string
  /**
   * field type
   */
  type?: string
  /**
   * is required
   */
  required?: boolean
  /**
   * field description
   */
  description?: string | string[]
}

/**
 * @example import [name], {[names]} from [value]
 * @example import http, { AxiosConfig } from 'axios'
 */
export interface StatementImported {
  name?: string
  names?: string[]
  namespace?: boolean
  type?: boolean
  value: string
}

/**
 * @example [export] [flag] [name] = [value]
 */
export interface StatementVariable {
  export?: boolean
  flag: 'let' | 'const' | 'var'
  name: string
  value?: string
}

/**
 * @example [export] type [name] = [value]
 */
export interface StatementTypeAlias {
  export?: boolean
  name: string
  value: string
}
