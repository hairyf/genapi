import { parseOpenapiSpecification } from '@genapi/parser'
import { provide } from '@genapi/shared'
import { beforeEach, describe, expect, it } from 'vitest'

import { swagger2Minimal } from '../../../../parser/test/fixtures/swagger2-minimal'
import * as gotTsModule from '../../../src/got/ts'

describe('presets/src/got/ts', () => {
  beforeEach(() => {
    provide({ interfaces: { add: () => {}, values: () => [], all: () => [] }, functions: { add: () => {}, values: () => [], all: () => [] }, configRead: undefined })
  })

  it('exports default openapiPipeline function', () => {
    expect(gotTsModule.default).toBeDefined()
    expect(typeof gotTsModule.default).toBe('function')
  })

  it('exports config, parser, compiler, generate, dest, original', () => {
    expect(gotTsModule).toHaveProperty('config')
    expect(gotTsModule).toHaveProperty('parser')
    expect(gotTsModule).toHaveProperty('compiler')
    expect(gotTsModule).toHaveProperty('generate')
    expect(gotTsModule).toHaveProperty('dest')
    expect(gotTsModule).toHaveProperty('original')
    expect(typeof gotTsModule.config).toBe('function')
    expect(typeof gotTsModule.parser).toBe('function')
    expect(typeof gotTsModule.compiler).toBe('function')
    expect(typeof gotTsModule.generate).toBe('function')
    expect(typeof gotTsModule.dest).toBe('function')
    expect(typeof gotTsModule.original).toBe('function')
  })

  it('openapiPipeline has config, parser, compiler, generate, dest, original methods', () => {
    expect(gotTsModule.default).toHaveProperty('config')
    expect(gotTsModule.default).toHaveProperty('parser')
    expect(gotTsModule.default).toHaveProperty('compiler')
    expect(gotTsModule.default).toHaveProperty('generate')
    expect(gotTsModule.default).toHaveProperty('dest')
    expect(gotTsModule.default).toHaveProperty('original')
    expect(typeof gotTsModule.default.config).toBe('function')
    expect(typeof gotTsModule.default.parser).toBe('function')
    expect(typeof gotTsModule.default.compiler).toBe('function')
    expect(typeof gotTsModule.default.generate).toBe('function')
    expect(typeof gotTsModule.default.dest).toBe('function')
    expect(typeof gotTsModule.default.original).toBe('function')
  })

  it('openapiPipeline can be called with source', async () => {
    const source = parseOpenapiSpecification(swagger2Minimal)
    const result = await gotTsModule.default({
      input: {
        json: source,
      },
      output: {
        main: 'test/fixtures/generated/test-output.ts',
        type: false, // Disable type file to avoid file operations
      },
    } as any)
    // dest function doesn't return a value, so result is undefined
    expect(result).toBeUndefined()
  })
})
