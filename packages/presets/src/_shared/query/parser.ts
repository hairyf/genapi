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

/** Query preset 统一 parser：固定三文件，useQuery(queryKey, queryFn)、useMutation(mutationFn)，description 统一 @wraps */
export function createQueryParser() {
  return createParser((config, { configRead, functions, interfaces }) => {
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

    const isRead = ['get', 'head'].includes(config.method.toLowerCase())
    const hook = hookName(name)
    const paramNames = fetcherParams.map(p => p.name).join(', ')

    if (isRead) {
      const keyItems = `${fetcherRef}.name, ${paramNames}`
      functions.add('main', {
        export: true,
        name: hook,
        description: [`@wraps ${name}`],
        parameters: fetcherParams,
        body: [
          `return useQuery({ queryKey: [${keyItems}], queryFn: () => ${fetcherRef}(${paramNames}) })`,
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
}
