import { parseOpenapiSpecification } from '@genapi/parser'
import { provide } from '@genapi/shared'
import { beforeEach, describe, expect, it } from 'vitest'

import { swagger2Minimal } from '../../../../parser/test/fixtures/swagger2-minimal'
import * as kyJsModule from '../../../src/ky/js'

describe('presets/src/ky/js', () => {
  beforeEach(() => {
    provide({ interfaces: { add: () => {}, values: () => [], all: () => [] }, functions: { add: () => {}, values: () => [], all: () => [] }, configRead: undefined })
  })

  it('exports default openapiPipeline function', () => {
    expect(kyJsModule.default).toBeDefined()
    expect(typeof kyJsModule.default).toBe('function')
  })

  it('exports config, parser, compiler, generate, dest, original', () => {
    expect(kyJsModule).toHaveProperty('config')
    expect(kyJsModule).toHaveProperty('parser')
    expect(kyJsModule).toHaveProperty('compiler')
    expect(kyJsModule).toHaveProperty('generate')
    expect(kyJsModule).toHaveProperty('dest')
    expect(kyJsModule).toHaveProperty('original')
    expect(typeof kyJsModule.config).toBe('function')
    expect(typeof kyJsModule.parser).toBe('function')
    expect(typeof kyJsModule.compiler).toBe('function')
    expect(typeof kyJsModule.generate).toBe('function')
    expect(typeof kyJsModule.dest).toBe('function')
    expect(typeof kyJsModule.original).toBe('function')
  })

  it('openapiPipeline has config, parser, compiler, generate, dest, original methods', () => {
    expect(kyJsModule.default).toHaveProperty('config')
    expect(kyJsModule.default).toHaveProperty('parser')
    expect(kyJsModule.default).toHaveProperty('compiler')
    expect(kyJsModule.default).toHaveProperty('generate')
    expect(kyJsModule.default).toHaveProperty('dest')
    expect(kyJsModule.default).toHaveProperty('original')
    expect(typeof kyJsModule.default.config).toBe('function')
    expect(typeof kyJsModule.default.parser).toBe('function')
    expect(typeof kyJsModule.default.compiler).toBe('function')
    expect(typeof kyJsModule.default.generate).toBe('function')
    expect(typeof kyJsModule.default.dest).toBe('function')
    expect(typeof kyJsModule.default.original).toBe('function')
  })

  it('openapiPipeline can be called with source', async () => {
    const source = parseOpenapiSpecification(swagger2Minimal)
    const result = await kyJsModule.default({
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
