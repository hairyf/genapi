import {
  createParser,
  parseMethodMetadata,
  parseMethodParameters,
  transformBodyStringify,
  transformFetchBody,
  transformHeaderOptions,
  transformParameters,
  transformQueryParams,
  transformUrlSyntax,
} from '@genapi/parser'

export const parser = createParser((config, { configRead, functions, interfaces }) => {
  const { parameters, interfaces: attachInters, options } = parseMethodParameters(config)
  let { name, description, url, responseType, body } = parseMethodMetadata(config)

  interfaces.push(...attachInters)
  parameters.push({
    name: 'config',
    type: 'RequestInit',
    required: false,
  })

  if (config.method.toLowerCase() !== 'get')
    options.unshift(['method', `"${config.method}"`])

  transformHeaderOptions('body', { options, parameters })

  options.push(['...', 'config'])

  const { spaceResponseType } = transformParameters(parameters, {
    syntax: 'typescript',
    configRead,
    description,
    interfaces,
    responseType,
  })

  transformBodyStringify('body', { options, parameters })
  url = transformQueryParams('query', { body, options, url })
  url = transformUrlSyntax(url, { baseURL: configRead.config.meta?.baseURL })
  const fetch = transformFetchBody(url, options, spaceResponseType)
  functions.push({
    export: true,
    async: true,
    name,
    description,
    parameters,
    body: [
      ...body,
      ...fetch,
    ],
  })
})
