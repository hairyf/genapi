import ts from "typescript"

export interface StatementFunction {
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

export interface StatementInterface {
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

export interface StatementImported {
  name?: string
  names?: string
  value: string
}

export interface StatementVariable {
  flag: ts.NodeFlags
  name: string
  value?: string
}

/**
 * @example 'a' > { a }
 * @example ['a', 'b'] > { a: b }
 * @example ['...', 'c'] > { ...c }
 */
export type LiteralFiled = string | [string | '...', string]
