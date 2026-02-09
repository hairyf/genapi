import { parseOpenapiSpecification } from '@genapi/parser'
import { provide } from '@genapi/shared'
import { beforeEach, describe, expect, it } from 'vitest'

import { swagger2Minimal } from '../../../../parser/test/fixtures/swagger2-minimal'
import * as ofetchJsModule from '../../../src/ofetch/js'

describe('presets/src/ofetch/js', () => {
  beforeEach(() => {
    provide({ interfaces: { add: () => {}, values: () => [], all: () => [] }, functions: { add: () => {}, values: () => [], all: () => [] }, configRead: undefined })
  })

  it('exports default openapiPipeline function', () => {
    expect(ofetchJsModule.default).toBeDefined()
    expect(typeof ofetchJsModule.default).toBe('function')
  })

  it('exports config, parser, compiler, generate, dest, original', () => {
    expect(ofetchJsModule).toHaveProperty('config')
    expect(ofetchJsModule).toHaveProperty('parser')
    expect(ofetchJsModule).toHaveProperty('compiler')
    expect(ofetchJsModule).toHaveProperty('generate')
    expect(ofetchJsModule).toHaveProperty('dest')
    expect(ofetchJsModule).toHaveProperty('original')
    expect(typeof ofetchJsModule.config).toBe('function')
    expect(typeof ofetchJsModule.parser).toBe('function')
    expect(typeof ofetchJsModule.compiler).toBe('function')
    expect(typeof ofetchJsModule.generate).toBe('function')
    expect(typeof ofetchJsModule.dest).toBe('function')
    expect(typeof ofetchJsModule.original).toBe('function')
  })

  it('openapiPipeline has config, parser, compiler, generate, dest, original methods', () => {
    expect(ofetchJsModule.default).toHaveProperty('config')
    expect(ofetchJsModule.default).toHaveProperty('parser')
    expect(ofetchJsModule.default).toHaveProperty('compiler')
    expect(ofetchJsModule.default).toHaveProperty('generate')
    expect(ofetchJsModule.default).toHaveProperty('dest')
    expect(ofetchJsModule.default).toHaveProperty('original')
    expect(typeof ofetchJsModule.default.config).toBe('function')
    expect(typeof ofetchJsModule.default.parser).toBe('function')
    expect(typeof ofetchJsModule.default.compiler).toBe('function')
    expect(typeof ofetchJsModule.default.generate).toBe('function')
    expect(typeof ofetchJsModule.default.dest).toBe('function')
    expect(typeof ofetchJsModule.default.original).toBe('function')
  })

  it('openapiPipeline can be called with source', async () => {
    const source = parseOpenapiSpecification(swagger2Minimal)
    const result = await ofetchJsModule.default({
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
