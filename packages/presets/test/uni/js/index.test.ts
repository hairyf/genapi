import { parseOpenapiSpecification } from '@genapi/parser'
import { provide } from '@genapi/shared'
import { beforeEach, describe, expect, it } from 'vitest'

import { swagger2Minimal } from '../../../../parser/test/fixtures/swagger2-minimal'
import * as uniJsModule from '../../../src/uni/js'

describe('presets/src/uni/js', () => {
  beforeEach(() => {
    provide({ interfaces: { add: () => {}, values: () => [], all: () => [] }, functions: { add: () => {}, values: () => [], all: () => [] }, configRead: undefined })
  })

  it('exports default openapiPipeline function', () => {
    expect(uniJsModule.default).toBeDefined()
    expect(typeof uniJsModule.default).toBe('function')
  })

  it('exports config, parser, compiler, generate, dest, original', () => {
    expect(uniJsModule).toHaveProperty('config')
    expect(uniJsModule).toHaveProperty('parser')
    expect(uniJsModule).toHaveProperty('compiler')
    expect(uniJsModule).toHaveProperty('generate')
    expect(uniJsModule).toHaveProperty('dest')
    expect(uniJsModule).toHaveProperty('original')
    expect(typeof uniJsModule.config).toBe('function')
    expect(typeof uniJsModule.parser).toBe('function')
    expect(typeof uniJsModule.compiler).toBe('function')
    expect(typeof uniJsModule.generate).toBe('function')
    expect(typeof uniJsModule.dest).toBe('function')
    expect(typeof uniJsModule.original).toBe('function')
  })

  it('openapiPipeline has config, parser, compiler, generate, dest, original methods', () => {
    expect(uniJsModule.default).toHaveProperty('config')
    expect(uniJsModule.default).toHaveProperty('parser')
    expect(uniJsModule.default).toHaveProperty('compiler')
    expect(uniJsModule.default).toHaveProperty('generate')
    expect(uniJsModule.default).toHaveProperty('dest')
    expect(uniJsModule.default).toHaveProperty('original')
    expect(typeof uniJsModule.default.config).toBe('function')
    expect(typeof uniJsModule.default.parser).toBe('function')
    expect(typeof uniJsModule.default.compiler).toBe('function')
    expect(typeof uniJsModule.default.generate).toBe('function')
    expect(typeof uniJsModule.default.dest).toBe('function')
    expect(typeof uniJsModule.default.original).toBe('function')
  })

  it('openapiPipeline can be called with source', async () => {
    const source = parseOpenapiSpecification(swagger2Minimal)
    const result = await uniJsModule.default({
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
