import type { ApiPipeline } from '@genapi/shared'
import { compile } from '@genapi/pipeline'
import { genInterface, genTypeObject } from 'knitwork-x'

const [Endpoint, Dynamic] = [Symbol.for('Endpoint'), Symbol.for('DynamicParam')]

export interface SchemaCompilerOptions {
  /** HTTP client function name (e.g., 'fetch' or 'ofetch') */
  httpClient: string
}

/** Ultimate type conversion: regex word boundary replacement, covering all complex nested scenarios */
function convert(str: string | undefined, names: Set<string>) {
  return str?.replace(/\b\w+\b/g, m => names.has(m) ? `Types.${m}` : m) || ''
}

export function createSchemaCompiler(options: SchemaCompilerOptions) {
  return function compiler(config: ApiPipeline.ConfigRead) {
    const routes = config.__schemaRoutes || []
    const allInterfaces = [
      ...(config.graphs.scopes.main?.interfaces || []),
      ...(config.graphs.scopes.type?.interfaces || []),
    ]
    const allTypings = config.graphs.scopes.type?.typings || []
    const interfaceNames = new Set([
      ...allInterfaces.map(i => i.name),
      ...allTypings.filter(t => t.name && !t.value?.includes('{')).map(t => t.name),
    ])

    // 1. Ultimate tree construction: leveraging reduce chaining operations
    const tree = routes.reduce((root: any, r: any) => {
      const node = r.path.split('/').filter(Boolean).reduce((curr: any, p: any) => {
        const key = p.startsWith('{') ? Dynamic : p
        return curr[key] = curr[key] || {}
      }, root)

      const ep = node[Endpoint] = node[Endpoint] || {}
      ep[r.method] = genTypeObject({
        response: convert(r.responseType, interfaceNames),
        ...(r.queryType && { query: convert(r.queryType, interfaceNames) }),
        ...(r.bodyType && { body: convert(r.bodyType, interfaceNames) }),
        ...(r.headersType && { headers: convert(r.headersType, interfaceNames) }),
      })
      return root
    }, {})

    // 2. Ultimate recursive generation: one-dimensional processing
    const toObj = (node: any, isRoot = false) => {
      const res: any = {}
      if (node[Endpoint])
        res['[Endpoint]'] = genTypeObject(node[Endpoint])
      if (node[Dynamic])
        res['[DynamicParam]'] = genTypeObject(toObj(node[Dynamic]))

      Object.keys(node).forEach(k => res[isRoot ? `/${k}` : k] = genTypeObject(toObj(node[k])))
      return res
    }

    // 3. $fetch declaration simplification (main scope)
    config.graphs.scopes.main.functions = [{
      export: true,
      name: '$fetch',
      async: true,
      generics: [{ name: 'T', extends: 'TypedFetchInput<APISchema>' }],
      parameters: [{ name: 'input', type: 'T', required: true }, { name: 'init', type: 'TypedFetchRequestInit<APISchema, T>', required: false }],
      body: [`return ${options.httpClient}(input, init as any) as Promise<TypedResponse<TypedFetchResponseBody<APISchema, T>>>`],
    }]

    // 4. Output injection: compile(main/type), inject APISchema into main when not onlyDeclaration
    config.outputs.forEach((out: ApiPipeline.Output) => {
      if (out.type === 'main' && !config.config.meta?.onlyDeclaration) {
        const code = compile(config, 'main')
        const schema = `\n// API Schema\n${genInterface('APISchema', toObj(tree, true))}\n`
        const idx = code.lastIndexOf('import')
        const pos = idx !== -1 ? code.indexOf('\n', idx) + 1 : 0
        out.code = code.slice(0, pos) + schema + code.slice(pos)
      }
      else if (out.type === 'type') {
        out.code = compile(config, 'type')
      }
    })

    return config
  }
}
