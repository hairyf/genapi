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
  interfaces.push(...attachInters)
  parameters.push({
    name: 'config',
    type: 'UnConfig<never>',
    required: false,
  })
  options.unshift('url')
  options.unshift(['method', `"${config.method}"`])
  if (configRead.config.baseURL)
    options.unshift('baseURL')

  const { spaceResponseType } = transformParameters(parameters, {
    syntax: 'typescript',
    configRead,
    description,
    interfaces,
    responseType,
  })
  url = transformUrlSyntax(url)

  functions.push({
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
