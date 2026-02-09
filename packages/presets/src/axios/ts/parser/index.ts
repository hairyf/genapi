import {
  createParser,
  literalFieldsToString,
  parseMethodMetadata,
  parseMethodParameters,
  transformParameters,
  transformUrlSyntax,
} from '@genapi/parser'

export const parser = createParser((config, { configRead, functions, interfaces }) => {
  const { parameters, interfaces: attachInters, options } = parseMethodParameters(config, {
    body: 'data',
    query: 'params',
  })

  let { name, description, url, responseType } = parseMethodMetadata(config)

  options.push(['...', 'config'])
  attachInters.forEach(i => interfaces.add('type', i))
  parameters.push({
    name: 'config',
    type: 'AxiosRequestConfig',
    required: false,
  })
  options.unshift('url')
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
  url = transformUrlSyntax(url)

  functions.add('main', {
    export: true,
    name,
    description,
    parameters,
    body: [
      `const url = ${url}`,
      `return http.request<${spaceResponseType}>({ ${literalFieldsToString(options)} })`,
    ],
  })
})
