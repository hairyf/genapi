import { parseOpenapiSpecification } from '@genapi/parser'
import { provide } from '@genapi/shared'
import { beforeEach, describe, expect, it } from 'vitest'

import { swagger2Minimal } from '../../../../parser/test/fixtures/swagger2-minimal'
import * as fetchTsModule from '../../../src/fetch/ts'

describe('presets/src/fetch/ts', () => {
  beforeEach(() => {
    provide({ interfaces: { add: () => {}, values: () => [], all: () => [] }, functions: { add: () => {}, values: () => [], all: () => [] }, configRead: undefined })
  })

  it('exports default openapiPipeline function', () => {
    expect(fetchTsModule.default).toBeDefined()
    expect(typeof fetchTsModule.default).toBe('function')
  })

  it('exports config, parser, compiler, generate, dest, original', () => {
    expect(fetchTsModule).toHaveProperty('config')
    expect(fetchTsModule).toHaveProperty('parser')
    expect(fetchTsModule).toHaveProperty('compiler')
    expect(fetchTsModule).toHaveProperty('generate')
    expect(fetchTsModule).toHaveProperty('dest')
    expect(fetchTsModule).toHaveProperty('original')
    expect(typeof fetchTsModule.config).toBe('function')
    expect(typeof fetchTsModule.parser).toBe('function')
    expect(typeof fetchTsModule.compiler).toBe('function')
    expect(typeof fetchTsModule.generate).toBe('function')
    expect(typeof fetchTsModule.dest).toBe('function')
    expect(typeof fetchTsModule.original).toBe('function')
  })

  it('openapiPipeline has config, parser, compiler, generate, dest, original methods', () => {
    expect(fetchTsModule.default).toHaveProperty('config')
    expect(fetchTsModule.default).toHaveProperty('parser')
    expect(fetchTsModule.default).toHaveProperty('compiler')
    expect(fetchTsModule.default).toHaveProperty('generate')
    expect(fetchTsModule.default).toHaveProperty('dest')
    expect(fetchTsModule.default).toHaveProperty('original')
    expect(typeof fetchTsModule.default.config).toBe('function')
    expect(typeof fetchTsModule.default.parser).toBe('function')
    expect(typeof fetchTsModule.default.compiler).toBe('function')
    expect(typeof fetchTsModule.default.generate).toBe('function')
    expect(typeof fetchTsModule.default.dest).toBe('function')
    expect(typeof fetchTsModule.default.original).toBe('function')
  })

  it('openapiPipeline can be called with source', async () => {
    const source = parseOpenapiSpecification(swagger2Minimal)
    const result = await fetchTsModule.default({
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
