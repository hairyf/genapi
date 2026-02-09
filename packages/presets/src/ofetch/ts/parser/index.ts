import {
  createParser,
  literalFieldsToString,
  parseMethodMetadata,
  parseMethodParameters,
  transformParameters,
  transformQueryParams,
  transformUrlSyntax,
} from '@genapi/parser'

export const parser = createParser((config, { configRead, functions, interfaces }) => {
  const { parameters, interfaces: attachInters, options } = parseMethodParameters(config, {
    formData: 'body',
    query: 'params',
  })

  let { name, description, url, responseType, body } = parseMethodMetadata(config)

  attachInters.forEach(i => interfaces.add('type', i))
  parameters.push({
    name: 'options',
    type: 'FetchOptions',
    required: false,
  })
  options.push(['...', 'options'])
  options.unshift(['method', `"${config.method}"`])
  if (configRead.config.meta?.baseURL)
    options.unshift('baseURL')

  const { spaceResponseType } = transformParameters(parameters, {
    syntax: 'typescript',
    configRead,
    description,
    interfaces: interfaces.all(),
    responseType,
  })

  url = transformQueryParams('query', { body, options, url })
  url = transformUrlSyntax(url)

  functions.add('main', {
    export: true,
    name,
    description,
    parameters,
    body: [
      `return ofetch<${spaceResponseType}>(${url}, {${literalFieldsToString(options)}})`,
    ],
  })
})
