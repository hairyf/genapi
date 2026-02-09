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
    type: 'import(\'ofetch\').FetchOptions',
    required: false,
  })
  options.push(['...', 'options'])
  options.unshift(['method', `"${config.method}"`])
  if (configRead.config.meta?.baseURL)
    options.unshift('baseURL')

  transformParameters(parameters, {
    syntax: 'ecmascript',
    configRead,
    description,
    interfaces: interfaces.all(),
    responseType,
  })

  url = transformQueryParams('query', { body, options, url })
  url = transformUrlSyntax(url, { baseURL: configRead.config.meta?.baseURL })

  functions.add('main', {
    export: true,
    async: true,
    name,
    description,
    parameters,
    body: [
      ...body,
      `return ofetch(${url}, {${literalFieldsToString(options)}})`,
    ],
  })
})
