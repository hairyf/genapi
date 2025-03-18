import type { ApiPipeline } from '@genapi/config'
import type { OpenAPISpecificationV2 } from 'openapi-specification-types'
import { type LiteralField, literalFieldsToString } from '../utils'

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

export function transformUrlSyntax(url: string, { baseURL }: BaseUrlSyntaxTransformOptions = {}) {
  if (baseURL)
    url = `\${baseURL}${url}`

  if (!url.includes('$'))
    return `'${url}'`

  if (url.includes('}/'))
    return `\`${url}\``

  const values = url.split(/\/\$/g).map(v => v.split('}/').map((v) => {
    if (v.startsWith('{')) {
      v = `$${v}`
      if (!v.endsWith('}'))
        v = `${v}}`
    }
    return v
  })).flatMap(v => v)
    .map(v => v.startsWith('$')
      ? v.replace('$', '')
        .replace('{', '')
        .replace('}', '')
      : `'${v}'`)

  return `[${values.join(', ')}].filter(Boolean).join('/')`
}

export function transformBaseURL(source: OpenAPISpecificationV2, { configRead }: BaseUrlTransformOptions) {
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
