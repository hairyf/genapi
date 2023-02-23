import ts from "typescript"

export interface FunctionOptions {
  /**
   * function name
   */
  name: string
  /**
   * function params
   */
  parameters?: StatementFiled[]
  /**
   * function block
   */
  body?: ts.Statement[]
  /**
   * is export
   */
  export?: boolean
  /**
   * function comment
   */
  comment?: string | string[]
}

export interface InterfaceOptions {
  /**
   * interface name
   */
  name: string
  /**
   * all properties
   */
  properties: StatementFiled[]
  /**
   * is export
   */
  export?: boolean
}

export interface StatementFiled {
  name: string
  type?: string
  required?: boolean
  description?: string | string[]
}

/**
 * @example 'a' > { a }
 * @example ['a', 'b'] > { a: b }
 * @example ['...', 'c'] > { ...c }
 */
export type LiteralFiled = string | [string | '...', string]
