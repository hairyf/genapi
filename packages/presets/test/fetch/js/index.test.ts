import { parseOpenapiSpecification } from '@genapi/parser'
import { provide } from '@genapi/shared'
import { beforeEach, describe, expect, it } from 'vitest'

import { swagger2Minimal } from '../../../../parser/test/fixtures/swagger2-minimal'
import * as fetchJsModule from '../../../src/fetch/js'

describe('presets/src/fetch/js', () => {
  beforeEach(() => {
    provide({ interfaces: { add: () => {}, values: () => [], all: () => [] }, functions: { add: () => {}, values: () => [], all: () => [] }, configRead: undefined })
  })

  it('exports default openapiPipeline function', () => {
    expect(fetchJsModule.default).toBeDefined()
    expect(typeof fetchJsModule.default).toBe('function')
  })

  it('exports config, parser, compiler, generate, dest, original', () => {
    expect(fetchJsModule).toHaveProperty('config')
    expect(fetchJsModule).toHaveProperty('parser')
    expect(fetchJsModule).toHaveProperty('compiler')
    expect(fetchJsModule).toHaveProperty('generate')
    expect(fetchJsModule).toHaveProperty('dest')
    expect(fetchJsModule).toHaveProperty('original')
    expect(typeof fetchJsModule.config).toBe('function')
    expect(typeof fetchJsModule.parser).toBe('function')
    expect(typeof fetchJsModule.compiler).toBe('function')
    expect(typeof fetchJsModule.generate).toBe('function')
    expect(typeof fetchJsModule.dest).toBe('function')
    expect(typeof fetchJsModule.original).toBe('function')
  })

  it('openapiPipeline has config, parser, compiler, generate, dest, original methods', () => {
    expect(fetchJsModule.default).toHaveProperty('config')
    expect(fetchJsModule.default).toHaveProperty('parser')
    expect(fetchJsModule.default).toHaveProperty('compiler')
    expect(fetchJsModule.default).toHaveProperty('generate')
    expect(fetchJsModule.default).toHaveProperty('dest')
    expect(fetchJsModule.default).toHaveProperty('original')
    expect(typeof fetchJsModule.default.config).toBe('function')
    expect(typeof fetchJsModule.default.parser).toBe('function')
    expect(typeof fetchJsModule.default.compiler).toBe('function')
    expect(typeof fetchJsModule.default.generate).toBe('function')
    expect(typeof fetchJsModule.default.dest).toBe('function')
    expect(typeof fetchJsModule.default.original).toBe('function')
  })

  it('openapiPipeline can be called with source', async () => {
    const source = parseOpenapiSpecification(swagger2Minimal)
    const result = await fetchJsModule.default({
      input: {
        json: source,
      },
      output: {
        main: 'test/fixtures/generated/test-output.js',
        type: false, // Disable type file to avoid file operations
      },
    } as any)
    // dest function doesn't return a value, so result is undefined
    expect(result).toBeUndefined()
  })
})
