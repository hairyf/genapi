import {
  createParser,
  literalFieldsToString,
  parseMethodMetadata,
  parseMethodParameters,
  transformBodyStringify,
  transformHeaderOptions,
  transformParameters,
  transformQueryParams,
  transformUrlSyntax,
} from '@genapi/parser'

export const parser = createParser((config, { configRead, functions, interfaces }) => {
  const { parameters, interfaces: attachInters, options } = parseMethodParameters(config, {
    formData: 'body',
  })

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

  transformParameters(parameters, {
    syntax: 'ecmascript',
    configRead,
    description,
    interfaces,
    responseType,
  })

  transformBodyStringify('body', { options, parameters })

  url = transformQueryParams('query', { body, options, url })
  url = transformUrlSyntax(url, { baseURL: configRead.config.baseURL })

  functions.push({
    export: true,
    async: true,
    name,
    description,
    parameters,
    body: [
      ...body,
      `const response = await fetch(${url}, { 
          ${literalFieldsToString(options)} 
        })`,
      'return response.json()',
    ],
  })
})
