import ts from 'typescript'
import type { MethodFunctionOptions } from '../../typings/parser'
import { createFunction, createVariable } from '../extra'
import { createRequest } from './ts-request'

export function createMethodFunction(o: MethodFunctionOptions) {

  const nodes = createFunction({
    name: o.name,
    export: true,
    comment: o.comment,
    parameters:  o.parameters,
    body: [
      createVariable(ts.NodeFlags.Const, 'url', o.url),
      createRequest(o.httpImport.name, o.responseType, ['url', ['method', `"${o.method}"`], ...o.options]),
    ]
  })

  return nodes
}
