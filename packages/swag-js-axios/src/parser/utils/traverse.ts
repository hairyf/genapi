import forIn from 'lodash/forIn'
import type { Method, Parameter, Paths } from 'openapi-specification-types'

export interface PathParameters {
  path: string
  parameters: Parameter[]
  method: string
  options: Method
}

export interface TraverseParametersCallback {
  (options: PathParameters): void
}

export function traversePaths(paths: Paths, callback: TraverseParametersCallback) {
  for (const [path, _others] of Object.entries(paths)) {
    const { parameters = [], ...methods } = _others
    forIn(methods, (options, method) => {
      callback({
        path,
        method,
        options,
        parameters,
      })
    })
  }
}
