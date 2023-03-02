import type { Method, Parameter } from 'openapi-specification-types'
import type { StatementField, StatementInterface } from 'apipgen'
import type { PathParameters } from '../traverse'
import type { LiteralField } from '../other'
import { isRequiredParameter, signAnyInter } from '../other'
import { varName } from '../format'
import { getParameterFields } from './parameter'

export function getFunctionOptions(pathParams: PathParameters) {
  const { method, options, path } = pathParams
  const parameters = fillParameters(options, pathParams.parameters)

  const requestConfigs = {
    body: [] as StatementField[],
    formData: [] as StatementField[],
    path: [] as StatementField[],
    query: [] as StatementField[],
    header: [] as StatementField[],
  }

  const config = {
    options: ['url'] as LiteralField[],
    parameters: [] as StatementField[],
    interfaces: [] as StatementInterface[],
  }

  for (const parameter of parameters)
    requestConfigs[parameter.in].push(getParameterFields(parameter))

  for (const [inType, properties] of Object.entries(requestConfigs) as [Parameter['in'], StatementField[]][]) {
    if (properties.length === 0)
      continue

    const name = inToAxiosField(inType)

    if (inType !== 'path')
      config.options.push(name)

    if (inType === 'header')
      signAnyInter(properties)

    if (inType === 'formData') {
      increaseFromDataParameter(name)
      continue
    }
    if (inType === 'body') {
      increaseBodyParameter(name, properties)
      continue
    }

    if (['header', 'path', 'query'].includes(inType)) {
      const typeName = varName([method, path, inType])
      config.interfaces.push({ name: typeName, properties, export: true })
      config.parameters.push({ name, type: typeName, required: isRequiredParameter(properties) })
    }
  }

  config.parameters.push({
    type: 'import("axios").AxiosRequestConfig',
    name: 'config',
    required: false,
  })

  config.options.push(['...', 'config'])

  function increaseBodyParameter(name: string, properties: StatementField[]) {
    config.parameters.push({
      name,
      type: properties[0].type,
      required: properties[0].required,
    })
  }
  function increaseFromDataParameter(name: string) {
    config.parameters.push({
      name,
      type: 'FormData',
      required: true,
    })
  }

  return config
}

function fillParameters(options: Method, parameters: Parameter[]) {
  parameters = parameters.filter((item) => {
    return !options.parameters?.some(v => v.name === item.name)
  })
  parameters = [...parameters, ...(options.parameters || [])]
  return parameters
}

function inToAxiosField(inType: Parameter['in']) {
  const schemas = {
    path: 'paths',
    body: 'data',
    query: 'params',
    header: 'headers',
    formData: 'data',
  }
  return schemas[inType]
}
