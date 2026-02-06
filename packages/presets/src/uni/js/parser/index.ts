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
    type: 'import(\'@uni-helper/uni-network\').UnConfig<never>',
    name: 'config',
    required: false,
  })
  options.unshift('url')
  options.unshift(['method', `"${config.method}"`])
  if (configRead.config.meta?.baseURL)
    options.unshift('baseURL')

  transformParameters(parameters, {
    syntax: 'ecmascript',
    configRead,
    description,
    interfaces,
    responseType,
    generic: 'import(\'@uni-helper/uni-network\').UnResponse<{__type__}>',
  })

  url = transformUrlSyntax(url)

  functions.push({
    export: true,
    name,
    description,
    parameters,
    body: [
      `const url = ${url}`,
      `return http.request({ ${literalFieldsToString(options)} })`,
    ],
  })
})
