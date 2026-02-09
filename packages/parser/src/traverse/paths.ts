import type { Method, Parameter, Paths, RequestBody, Responses } from 'openapi-specification-types'

const HTTP_METHODS = ['get', 'put', 'post', 'delete', 'patch', 'head', 'options'] as const

function isParameter(p: Parameter | { $ref?: string }): p is Parameter {
  return p != null && 'name' in p && 'in' in p
}

function isOperationObject(value: unknown): value is Method {
  return value != null && typeof value === 'object' && 'responses' in value
}

/**
 * Aggregated path + method data: path, merged parameters, HTTP method, operation options, and responses.
 */
export interface PathMethod {
  path: string
  parameters: Parameter[]
  method: string
  options: Method
  responses: Responses
}

/**
 * Walks OpenAPI paths and invokes a callback for each path + method with merged parameters and options.
 *
 * @param paths - OpenAPI paths object
 * @param callback - Called for each (path, method) with path, parameters, method, options, responses
 * @group Traverse
 * @example
 * ```ts
 * traversePaths(spec.paths, (config) => {
 *   const { path, method, parameters } = config
 *   // handle each operation
 * })
 * ```
 */
export function traversePaths(paths: Paths, callback: (options: PathMethod) => void) {
  for (const [path, _others] of Object.entries(paths)) {
    if (typeof _others === 'string' || Array.isArray(_others))
      continue
    const pathParameters = (Array.isArray(_others.parameters) ? _others.parameters : [])
      .filter(isParameter)
    for (const method of HTTP_METHODS) {
      const options = _others[method]
      if (!isOperationObject(options))
        continue
      const parametersMap = new Map<string, Parameter>()
      for (const parameter of pathParameters)
        parametersMap.set(parameter.name, parameter)
      const opParams = (options.parameters ?? []).filter(isParameter)
      for (const parameter of opParams)
        parametersMap.set(parameter.name, parameter)
      const parameters = [...parametersMap.values()]
      if (options.requestBody && 'content' in options.requestBody)
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
  if (!requestBody?.content)
    return
  const multipart = requestBody.content['multipart/form-data']
  if (multipart && 'schema' in multipart && multipart.schema?.properties) {
    const properties = multipart.schema.properties
    for (const name of Object.keys(properties)) {
      parameters.push({
        in: 'formData',
        name,
        description: requestBody.description,
        ...(properties[name] as object),
      })
    }
    return
  }
  const json = requestBody.content['application/json']
  if (json && typeof json === 'object') {
    parameters.push({
      ...(json as object),
      description: requestBody.description,
      in: 'body',
      name: 'body',
    })
  }
}
