export interface StatementFiled {
  name: string
  type: string
  required?: boolean
  description?: string | string[] 
}
export type LiteralFiled = string | [string | '...', string]
