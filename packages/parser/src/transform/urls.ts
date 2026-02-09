import type { ApiPipeline } from '@genapi/shared'
import type { OpenAPISpecificationV2 } from 'openapi-specification-types'
import type { LiteralField } from '../utils'
import { inject } from '@genapi/shared'
import { literalFieldsToString } from '../utils'

export interface QueryUrlTransformOptions {
  body?: string[]
  url?: string
  optionKey?: string
  options: LiteralField[]
}

export interface BaseUrlSyntaxTransformOptions {
  baseURL?: string | false
}

export interface BaseUrlTransformOptions {
  configRead: ApiPipeline.ConfigRead
}
/**
 * Transforms query params for codegen: optional URLSearchParams snippet and option list updates.
 *
 * @param name - Parameter name
 * @param options - Options for the transform
 * @param options.body - Array to push URLSearchParams snippet into
 * @param options.options - Literal field list to update
 * @param options.optionKey - Optional key for URLSearchParams in options
 * @param options.url - Optional URL string to append query to
 * @returns Updated url fragment
 * @group Transform
 * @example
 * ```ts
 * const urlSuffix = transformQueryParams('query', { body: [], options: ['query'], url: '/api' })
 * // urlSuffix may be '?${querystr}', body/options mutated
 * ```
 */
export function transformQueryParams(name: string, { body, options, optionKey, url }: QueryUrlTransformOptions) {
  url = url || ''
  if (optionKey) {
    const searchParams = [optionKey, `new URLSearchParams(Object.entries(${name} || {}))`] as LiteralField
    if (options.includes(name))
      options.splice(options.findIndex(v => v === name), 1, searchParams)
  }
  else if (options.includes(name)) {
    options.splice(options.findIndex(v => v === name), 1)
    body?.push(`const ${name}str = new URLSearchParams(Object.entries(${name} || {}))`)
    url += `?\${${name}str}`
  }
  return url || ''
}

/**
 * Wraps URL in template literal or string literal and optionally prefixes baseURL.
 *
 * @param url - Path or full URL
 * @param options - Optional options
 * @param options.baseURL - Optional base URL to prefix
 * @returns Code string for the URL
 * @group Transform
 * @example
 * ```ts
 * transformUrlSyntax('/user/${paths.id}', { baseURL: true }) // '${baseURL}/user/${paths.id}' as template
 * transformUrlSyntax('/api') // "'/api'"
 * ```
 */
export function transformUrlSyntax(url: string, { baseURL }: BaseUrlSyntaxTransformOptions = {}) {
  if (baseURL)
    url = `\${baseURL}${url}`
  if (!url.includes('$'))
    return `'${url}'`
  else
    return `\`${url}\``
}

/**
 * Injects baseURL from config into spec when config.baseURL is set.
 *
 * @param source - Swagger/OpenAPI spec (mutated)
 * @group Transform
 * @example
 * ```ts
 * transformBaseURL(spec)
 * // configRead.config.meta.baseURL and configRead.graphs.variables may be set from spec.host/schemes
 * ```
 */
export function transformBaseURL(source: OpenAPISpecificationV2) {
  const { configRead } = inject()

  if (configRead.config.meta?.baseURL === false)
    return

  if (!configRead.config.meta?.baseURL && source.schemes?.length && source.host) {
    if (!configRead.config.meta) {
      configRead.config.meta = {}
    }
    const host = source.host!
    const basePath = source.basePath ?? ''
    const isFullUrl = /^https?:\/\//.test(host)
    const isRelativePath = host.startsWith('/') || host === basePath
    let baseURLStr: string
    if (isFullUrl) {
      baseURLStr = host.endsWith('/') ? host : `${host}/`
    }
    else if (isRelativePath) {
      const single = `${(host || basePath).replace(/\/$/, '')}/`
      const inputUri = configRead.inputs?.uri
      if (typeof inputUri === 'string' && /^https?:\/\//.test(inputUri)) {
        baseURLStr = new URL(single, inputUri).href
        if (!baseURLStr.endsWith('/'))
          baseURLStr += '/'
      }
      else {
        baseURLStr = single.startsWith('/') ? single : `/${single}`
      }
    }
    else {
      baseURLStr = `${source.schemes!.includes('https') ? 'https://' : 'http://'}${host}${basePath}${basePath.endsWith('/') ? '' : '/'}`
    }
    configRead.config.meta.baseURL = `"${baseURLStr}"`
  }

  if (configRead.config.meta?.baseURL) {
    const ctx = inject()
    const baseURLVar = {
      export: true,
      flag: 'const' as const,
      name: 'baseURL',
      value: configRead.config.meta.baseURL,
    }
    const hasApiOutput = configRead.outputs?.some(o => o.type === 'api')
    if (hasApiOutput)
      ctx.variables.add('api', baseURLVar)
    else
      ctx.variables.add('main', baseURLVar)
  }
}

/**
 * Returns the request/response body snippet for fetch-based clients (json/text/none/void) based on response type.
 *
 * @param url - Code expression for the URL (e.g. template literal)
 * @param options - Literal options for fetch (method, headers, body, etc.)
 * @param spaceResponseType - Resolved response type (void, string, number, any, or interface name)
 * @returns Array of statement strings (e.g. fetch + return response.json())
 * @example
 * ```ts
 * transformFetchBody('url', ['method: "GET"'], 'User') // ['const response = await fetch(url, {...})', 'return response.json() as Promise<User>']
 * ```
 */
export function transformFetchBody(url: string, options: LiteralField[], spaceResponseType: string) {
  const bodies = {
    json: [
      `const response = await fetch(${url}, { 
        ${literalFieldsToString(options)} 
      })`,
      `return response.json() as Promise<${spaceResponseType}>`,
    ],
    text: [
      `const response = await fetch(${url}, { 
        ${literalFieldsToString(options)} 
      })`,
      'return response.text() as Promise<string>',
    ],
    none: [
      `const response = await fetch(${url}, { 
        ${literalFieldsToString(options)} 
      })`,
      'return response',
    ],
    void: [
      `await fetch(${url}, {
        ${literalFieldsToString(options)} 
      })`,
    ],
  }

  if (spaceResponseType === 'void')
    return bodies.void

  if (spaceResponseType === 'string' || spaceResponseType === 'number')
    return bodies.text

  if (spaceResponseType === 'any')
    return bodies.none

  return bodies.json
}
