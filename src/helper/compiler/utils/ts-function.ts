import ts from 'typescript'
import type { MethodStatementFunction } from '../../typings/parser'
import { createFunction, createVariable } from '../extra'
import { createRequest } from './ts-request'

export function createMethodFunction(o: MethodStatementFunction) {

  const nodes = createFunction(
    true,
    o.comment,
    o.name,
    o.parameters,
    [
      createVariable(ts.NodeFlags.Const, 'url', o.url),
      createRequest(o.lib, o.responseType, ['url', ['method', `"${o.method}"`], ...o.options]),
    ]
  )
  
  return nodes
}
