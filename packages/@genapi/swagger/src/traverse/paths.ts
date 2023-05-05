import forIn from 'lodash/forIn'
import type { Method, Parameter, Paths, Responses } from 'openapi-specification-types'

export interface PathMethod {
  path: string
  parameters: Parameter[]
  method: string
  options: Method
  responses: Responses
}

export function traversePaths(paths: Paths, callback: (options: PathMethod) => void) {
  for (const [path, _others] of Object.entries(paths)) {
    let { parameters = [], ...methods } = _others

    forIn(methods, (options, method) => {
      parameters = parameters.filter((item) => {
        return !options.parameters?.some(v => v.name === item.name)
      })
      parameters = [...parameters, ...(options.parameters || [])]

      callback({
        responses: options.responses,
        path,
        method,
        options,
        parameters,
      })
    })
  }
}
