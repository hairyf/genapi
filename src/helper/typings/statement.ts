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
  body?: string[]
  /**
   * is export
   */
  export?: boolean
  /**
   * function description
   */
  description?: string | string[]
}

export interface StatementInterface {
  /**
   * interface name
   */
  name: string
  /**
   * all properties
   */
  properties?: StatementFiled[]
  /**
   * is export
   */
  export?: boolean
}

export interface StatementFiled {
  /**
   * filed name
   */
  name: string
  /**
   * filed type
   */
  type?: string
  /**
   * is required
   */
  required?: boolean
  /**
   * filed description
   */
  description?: string | string[]
}

export interface StatementImported {
  name?: string
  names?: string
  value: string
}

export interface StatementVariable {
  flag: 'let' | 'const' | 'var'
  name: string
  value?: string
}

export interface StatementTypeAlias {
  name: string
  value: string
}
