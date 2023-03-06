import type { ApiPipeline } from 'apipgen'
import type { OpenAPISpecificationV2 } from 'openapi-specification-types'
import type { LiteralField } from '../utils'

export interface QueryUrlTransformOptions {
  body?: string[]
  key?: string
  url?: string
  options: LiteralField[]
}

export interface BaseUrlSyntaxTransformOptions {
  baseURL?: string
}

export interface BaseUrlTransformOptions {
  configRead: ApiPipeline.ConfigRead
}
export function transformQueryParams(name: string, { body, options, key, url }: QueryUrlTransformOptions) {
  if (key) {
    const searchParams = [key, `new URLSearchParams(Object.entries(${name}))`] as LiteralField
    if (options.includes(name))
      options.splice(options.findIndex(v => v === name), 1, searchParams)
  }
  else if (options.includes(name)) {
    options.splice(options.findIndex(v => v === name), 1)
    body?.push(`const _${name}_ = \`?\${new URLSearchParams(Object.entries(${name})).toString()}\``)
    url += `\${_${name}_}`
  }
  return url || ''
}

export function transformUrlSyntax(url: string, { baseURL }: BaseUrlSyntaxTransformOptions = {}) {
  if (baseURL)
    url = `\${baseURL}${url}`
  return url.includes('$') ? `\`${url}\`` : `'${url}'`
}

export function transformBaseURL(source: OpenAPISpecificationV2, { configRead }: BaseUrlTransformOptions) {
  if (!configRead.config.baseURL && source.schemes.length && source.host) {
    const prefix = source.schemes.includes('https') ? 'https://' : 'http://'
    configRead.config.baseURL = `"${prefix}${source.host}${source.basePath}/"`
  }

  if (configRead.config.baseURL) {
    configRead.graphs.variables.push({
      export: true,
      flag: 'const',
      name: 'baseURL',
      value: configRead.config.baseURL,
    })
  }
}
