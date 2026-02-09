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
  attachInters.forEach(i => interfaces.add('type', i))
  parameters.push({
    name: 'config',
    type: 'OptionsOfTextResponseBody',
    required: false,
  })
  options.push(['...', 'config'])
  if (configRead.config.meta?.baseURL)
    options.unshift(['prefixUrl', 'baseURL'])

  for (const parameter of parameters) {
    if (parameter.type === 'FormData')
      parameter.type = 'any'
  }

  const { spaceResponseType } = transformParameters(parameters, {
    syntax: 'typescript',
    configRead,
    description,
    interfaces: interfaces.all(),
    responseType,
  })

  transformBodyStringify('body', { options, parameters })
  transformQueryParams('query', { optionKey: 'searchParams', options })
  url = transformUrlSyntax(url)

  functions.add('main', {
    export: true,
    async: true,
    name,
    description,
    parameters,
    body: [
      `const response = http.${config.method}(${url}, {
          ${literalFieldsToString(options)}
        })`,
      `return response.json<${spaceResponseType}>()`,
    ],
  })
})
