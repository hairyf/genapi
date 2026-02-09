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

function hookName(fetcherName: string) {
  return `use${fetcherName.charAt(0).toUpperCase()}${fetcherName.slice(1)}`
}

export const parser = createParser((config, { configRead, functions, interfaces }) => {
  const { parameters, interfaces: attachInters, options } = parseMethodParameters(config)
  let { name, description, url, responseType, body } = parseMethodMetadata(config)

  attachInters.forEach(i => interfaces.add('type', i))
  const fetcherParams = [...parameters]
  fetcherParams.push({
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
    interfaces: interfaces.all(),
    responseType,
  })

  transformBodyStringify('body', { options, parameters })
  url = transformQueryParams('query', { body, options, url })
  url = transformUrlSyntax(url, { baseURL: configRead.config.meta?.baseURL })
  const fetchBody = transformFetchBody(url, options, spaceResponseType)

  const hasApiOutput = configRead.outputs.some(o => o.type === 'api')
  const fetcherScope = hasApiOutput ? 'api' : 'main'
  const fetcherRef = hasApiOutput ? `Api.${name}` : name

  // 1. Fetcher function → api scope (index.api.ts) or main when single file
  functions.add(fetcherScope, {
    export: true,
    async: true,
    name,
    description,
    parameters: fetcherParams,
    body: [
      ...body,
      ...fetchBody,
    ],
  })

  // 2. Query/Mutation hook → main scope (index.ts)
  const isRead = ['get', 'head'].includes(config.method.toLowerCase())
  const hook = hookName(name)
  const paramNames = fetcherParams.map(p => p.name).join(', ')

  if (isRead) {
    const queryKeyItems = `'${name}', ${paramNames}`
    functions.add('main', {
      export: true,
      name: hook,
      description: [`@wraps ${name}`],
      parameters: fetcherParams,
      body: [
        `return useQuery({ 
        queryKey: [${queryKeyItems}],
        queryFn: () => ${fetcherRef}(${paramNames}),
        ...config,
      })`,
      ],
    })
  }
  else {
    functions.add('main', {
      export: true,
      name: hook,
      description: [`@wraps ${name}`],
      parameters: [],
      body: [
        `return useMutation({ mutationFn: ${fetcherRef} })`,
      ],
    })
  }
})
