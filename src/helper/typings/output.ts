import { Node } from 'typescript'
export interface BuildOutput {
  type: 'request' | 'typings'
  root: string
  import: string
  path: string
  ast?: Node[] | Node
  code?: string
}