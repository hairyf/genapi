import {
  createParser,
  literalFieldsToString,
  parseMethodMetadata,
  parseMethodParameters,
  transformBodyStringify,
  transformParameters,
  transformQueryParams,
  transformUrlSyntax,
} from '@genapi/parser'

export const parser = createParser((config, { configRead, functions, interfaces }) => {
  const { parameters, interfaces: attachInters, options } = parseMethodParameters(config)
  let { name, description, url, responseType } = parseMethodMetadata(config)

  interfaces.push(...attachInters)
  parameters.push({
    name: 'config',
    type: 'import(\'ky\').Options',
    required: false,
  })
  options.push(['...', 'config'])
  if (configRead.config.baseURL)
    options.unshift(['prefixUrl', 'baseURL'])

  transformParameters(parameters, {
    syntax: 'ecmascript',
    configRead,
    description,
    interfaces,
    responseType,
    generic: 'import(\'ky\').KyResponse<{__type__}>',
  })
  transformBodyStringify('body', { options, parameters })
  transformQueryParams('query', { optionKey: 'searchParams', options })
  url = transformUrlSyntax(url)

  functions.push({
    export: true,
    async: true,
    name,
    description,
    parameters,
    body: [
      `const response = await http(${url}, {
          ${literalFieldsToString(options)}
        })`,
      'return response.json()',
    ],
  })
})
