import type { Method, Parameter, Paths, RequestBody, Responses } from 'openapi-specification-types'

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
    for (const method in methods) {
      const options = methods[method as keyof typeof methods]
      parameters = parameters.filter((item) => {
        return !options.parameters?.some(v => v.name === item.name)
      })
      parameters = [...parameters, ...(options.parameters || [])]
      extendsRequestBody(parameters, options.requestBody)
      callback({
        responses: options.responses,
        path,
        method,
        options,
        parameters,
      })
    }
  }
}

function extendsRequestBody(parameters: Parameter[], requestBody?: RequestBody) {
  if (!requestBody)
    return
  if (requestBody.content['multipart/form-data']) {
    const properties = requestBody.content['multipart/form-data'].schema.properties!
    for (const name in Object.keys(properties)) {
      parameters.push({
        required: requestBody.required,
        in: 'formData',
        name,
        description: requestBody.description,
        ...properties[name],
      })
    }
    return
  }

  if (requestBody.content['application/json']) {
    parameters.push({
      ...requestBody.content['application/json'],
      description: requestBody.description,
      required: requestBody.required,
      in: 'body',
      name: 'body',
    })
  }
}
