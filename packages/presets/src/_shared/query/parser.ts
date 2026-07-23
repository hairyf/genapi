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

/** Prefix schema-defined type names with `Types.` for the main file scope */
function prefixSchemaType(type: string): string {
  const arraySuffix = type.endsWith('[]') ? '[]' : ''
  const baseType = arraySuffix ? type.slice(0, -2) : type
  const primitives = new Set(['string', 'number', 'boolean', 'void', 'null', 'undefined', 'any', 'never', 'unknown', 'object', 'symbol', 'bigint'])
  if (/^[A-Z]\w*$/.test(baseType) && !primitives.has(baseType))
    return `Types.${baseType}${arraySuffix}`
  return type
}

/** Query preset 统一 parser */
export function createQueryParser() {
  return createParser((config, { configRead, functions, interfaces, typings }) => {
    const { parameters, interfaces: attachInters, options: optList } = parseMethodParameters(config)
    let { name, description, url, responseType, body } = parseMethodMetadata(config)

    attachInters.forEach(i => interfaces.add('type', i))

    const fetcherParams = [...parameters]
    fetcherParams.push({
      name: 'config',
      type: 'RequestInit',
      required: false,
    })

    if (config.method.toLowerCase() !== 'get')
      optList.unshift(['method', `"${config.method}"`])

    transformHeaderOptions('body', { options: optList, parameters })

    optList.push(['...', 'config'])

    const { spaceResponseType } = transformParameters(parameters, {
      syntax: 'typescript',
      interfaces: interfaces.all(),
      configRead,
      description,
      responseType,
    })

    transformBodyStringify('body', { options: optList, parameters })
    url = transformQueryParams('query', { body, options: optList, url })
    url = transformUrlSyntax(url, { baseURL: configRead.config.meta?.baseURL })
    const fetchBody = transformFetchBody(url, optList, spaceResponseType)

    const fetcherRef = `apis.${name}`
    functions.add('api', {
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

    // Add type aliases to type scope (only once per configRead, checked by existing count)
    if (typings.values('type').length === 0) {
      typings.add('type', {
        export: true,
        name: 'ExactQueryOptions',
        generic: 'Response, Query',
        value: 'Omit<Parameters<typeof useQuery<Response, Error, Response, readonly [string, Query]>>[0], "queryKey" | "queryFn">',
      })
      typings.add('type', {
        export: true,
        name: 'InitiaQueryOptions',
        generic: 'RequestConfig = any, Response = void',
        value: 'Omit<ExactQueryOptions<Response, RequestConfig>, "queryKey" | "queryFn"> & { request: RequestConfig }',
      })
      typings.add('type', {
        export: true,
        name: 'InitiaMutationOptions',
        generic: 'RequestConfig = any, Response = void',
        value: 'Omit<Parameters<typeof useMutation<Response, Error, RequestConfig>>[0], "mutationFn">',
      })
    }

    const isRead = ['get', 'head'].includes(config.method.toLowerCase())
    const hook = hookName(name)
    const cleanResponseType = responseType ? prefixSchemaType(responseType) : 'void'

    // Build request type from fetcher params (e.g. "{ query?: Types.X, config?: RequestInit }")
    const requestFields = fetcherParams.map(p => `${p.name}${p.required ? '' : '?'}: ${p.type}`)
    const requestType = `{ ${requestFields.join(', ')} }`
    const requestAccessors = fetcherParams.map(p => `request.${p.name}`).join(', ')

    // options 是否必传：取决于 request 中有没有 required 的字段
    const isRequired = fetcherParams.some(p => p.required === true)
    const requestKey = isRequired ? 'options.request' : 'options?.request || {}'

    description = [...description.filter(d => !d.startsWith('@method')), `@see apis.${name}`]

    if (isRead) {
      functions.add('main', {
        export: true,
        name: hook,
        description,
        parameters: [{
          name: 'options',
          type: `Types.InitiaQueryOptions<${requestType}, ${cleanResponseType}>`,
          required: isRequired,
        }],
        body: [
          `return useQuery({`,
          `  queryKey: [${fetcherRef}.name, ${requestKey}] as const, `,
          `  queryFn: ({ queryKey: [_, request] }) => ${fetcherRef}(${requestAccessors}), `,
          `  ...options`,
          `})`,
        ],
      })
    }
    else {
      functions.add('main', {
        export: true,
        name: hook,
        description,
        parameters: [{
          name: 'options',
          type: `Types.InitiaMutationOptions<${requestType}, ${cleanResponseType}>`,
          required: isRequired,
        }],
        body: [
          `return useMutation({`,
          `  mutationFn: (request) => ${fetcherRef}(${requestAccessors}),`,
          `  ...options`,
          `})`,
        ],
      })
    }
  })
}
