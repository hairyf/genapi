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
 */
export function transformBaseURL(source: OpenAPISpecificationV2) {
  const { configRead } = inject()

  if (configRead.config.baseURL === false)
    return

  if (!configRead.config.baseURL && source.schemes?.length && source.host) {
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
