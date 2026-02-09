import type { StatementField, StatementInterface } from '@genapi/shared'
import type { Parameter } from 'openapi-specification-types'
import type { ParserContext } from '../parser'
import type { PathMethod } from '../traverse'
import type { InSchemas, LiteralField } from '../utils'
import { inject, provide } from '@genapi/shared'
import { camelCase } from '@hairy/utils'
import { transformOperation } from '../transform'
import { isRequiredParameter, signAnyInter, toUndefField, varName } from '../utils'
import { parseParameterFiled } from './parameter'
import { parseSchemaType } from './schema'

export type { InSchemas }

/**
 * Parses path/method parameters into function options (body, query, path, header, etc.) and provides config for codegen.
 *
 * @param pathMethod - Path, method, and merged parameters for one operation
 * @param pathMethod.method - HTTP method
 * @param pathMethod.parameters - Merged path + operation parameters
 * @param pathMethod.path - Path pattern (e.g. /user/{id})
 * @param schemas - Optional schema names for body/query/path/header to customize option keys
 * @returns Config with options, parameters, and interfaces; also provides config into context for this path/method
 * @example
 * ```ts
 * const config = parseMethodParameters({ method: 'get', path: '/user/{id}', parameters }, schemas)
 * // config.parameters, config.options, config.interfaces
 * ```
 */
export function parseMethodParameters({ method, parameters, path }: PathMethod, schemas?: InSchemas) {
  const requestConfigs: Record<string, StatementField[]> = {
    body: [],
    formData: [],
    path: [],
    query: [],
    header: [],
    cookie: [],
    querystring: [],
  }

  const config = {
    options: [] as LiteralField[],
    parameters: [] as StatementField[],
    interfaces: [] as StatementInterface[],
  }

  for (const parameter of parameters) {
    const key = parameter.in
    if (key in requestConfigs)
      requestConfigs[key].push(parseParameterFiled(parameter))
  }

  for (const [inType, properties] of Object.entries(requestConfigs)) {
    if (properties.length === 0)
      continue

    const name = toUndefField(inType as Parameter['in'], schemas)

    if (inType !== 'path')
      config.options.push(name)

    if (inType === 'header')
      signAnyInter(properties)

    if (inType === 'formData') {
      increaseFromDataParameter(name)
      continue
    }
    if (inType === 'body') {
      increaseBodyParameter(name, properties)
      continue
    }

    if (['header', 'path', 'query', 'cookie', 'querystring'].includes(inType)) {
      const typeName = varName([method, path, inType])
      config.interfaces.push({ name: typeName, properties, export: true })
      const required = inType === 'path' || isRequiredParameter(properties)
      config.parameters.push({ name, type: typeName, required })
    }
  }

  function increaseBodyParameter(name: string, properties: StatementField[]) {
    config.parameters.push({
      required: properties[0].required,
      type: properties[0].type,
      name,
    })
  }
  function increaseFromDataParameter(name: string) {
    config.parameters.push({
      type: 'FormData',
      required: true,
      name,
    })
  }

  // fix: for path required parameters, move to the end
  config.parameters.sort(a => (a.required ? -1 : 1))

  // Inject method parameter config into named context `${method}/${path}` (parameters + options)
  provide(`${method}/${path}`, { parameters: config.parameters, options: config.options })
  return config
}

/**
 * Builds method metadata (name, url template, response type, comments) from path/method and applies transform/patch.
 *
 * @param pathMethod - Path, method, responses, and operation options
 * @param pathMethod.method - HTTP method
 * @param pathMethod.path - Path pattern
 * @param pathMethod.responses - OpenAPI responses map
 * @param pathMethod.options - Operation object (summary, description, tags, etc.)
 * @returns Object with name, url, responseType, description, body; also provides responseType into context
 * @example
 * ```ts
 * const meta = parseMethodMetadata(pathMethod)
 * // meta.name, meta.url, meta.responseType, meta.description
 * ```
 */
export function parseMethodMetadata({ method, path, responses, options: meta }: PathMethod) {
  const { configRead, interfaces } = inject<ParserContext>()
  const allInterfaces = interfaces.all()
  const metaAny = meta as { consumes?: string[] }

  // 1. 结构化注释生成
  const comments = [
    meta.summary && `@summary ${meta.summary}`,
    meta.description && `@description ${meta.description}`,
    `@method ${method}`,
    meta.tags?.length && `@tags ${meta.tags.join(' | ')}`,
    metaAny.consumes?.length && `@consumes ${metaAny.consumes.join('; ')}`,
  ].filter((c): c is string => !!c)

  // 2. 路径处理
  let name = camelCase(`${method}/${path}`)
  const url = path.replace(/\{/g, '${paths.')

  // 3. 响应 Schema 提取逻辑 (解耦与简化)
  const getResponseSchema = () => {
    const res200 = responses['200']
    const resDefault = responses.default

    // 优先尝试从 content/application/json 获取 (OpenAPI 3.0)
    const getContentSchema = (res: any) => res?.content?.['application/json']?.schema
    const schemaFromContent = getContentSchema(res200) ?? getContentSchema(resDefault)
    if (schemaFromContent)
      return schemaFromContent

    // 兜底从根节点获取 (Swagger 2.0)
    if (res200 && 'schema' in res200)
      return (res200 as any).schema
    return null
  }

  const responseSchema = getResponseSchema()
  let responseType = responseSchema ? parseSchemaType(responseSchema as any) : 'void'

  // 4. 强制必填标记逻辑 (递归优化)
  if (configRead.config.meta?.responseRequired && responseType !== 'void') {
    const processedTypes = new Set<string>() // 防止循环引用导致死循环
    const markRequiredRecursive = (typeName: string) => {
      if (processedTypes.has(typeName))
        return
      processedTypes.add(typeName)
      const targetInterface = allInterfaces.find((v: StatementInterface) => v.name === typeName)
      targetInterface?.properties?.forEach((prop: StatementField) => {
        prop.required = true
        if (prop.type)
          markRequiredRecursive(prop.type)
      })
    }
    markRequiredRecursive(responseType)
  }

  // 5. 转换与注入
  const config = inject(`${method}/${path}`)
  const transformed = transformOperation({
    configRead,
    name,
    parameters: config?.parameters,
    responseType,
  })

  name = transformed.name
  responseType = transformed.responseType

  provide(name, { responseType })

  return {
    description: comments,
    name,
    url,
    responseType,
    body: [] as string[],
  }
}
