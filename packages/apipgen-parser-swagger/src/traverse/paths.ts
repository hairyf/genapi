import forIn from 'lodash/forIn'
import type { Method, Parameter, Paths } from 'openapi-specification-types'

export interface PathMethod {
  path: string
  parameters: Parameter[]
  method: string
  options: Method
}

export function traversePaths(paths: Paths, callback: (options: PathMethod) => void) {
  for (const [path, _others] of Object.entries(paths)) {
    let { parameters = [], ...methods } = _others

    forIn(methods, (options, method) => {
      parameters = parameters.filter((item) => {
        return !options.parameters?.some(v => v.name === item.name)
      })
      callback({
        path,
        method,
        options,
        parameters: [...parameters, ...options.parameters],
      })
    })
  }
}
