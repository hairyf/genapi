import { parseOpenapiSpecification } from '@genapi/parser'
import { provide } from '@genapi/shared'
import { beforeEach, describe, expect, it } from 'vitest'

import { swagger2Minimal } from '../../../../parser/test/fixtures/swagger2-minimal'
import * as kyTsModule from '../../../src/ky/ts'

describe('presets/src/ky/ts', () => {
  beforeEach(() => {
    provide({ interfaces: { add: () => {}, values: () => [], all: () => [] }, functions: { add: () => {}, values: () => [], all: () => [] }, configRead: undefined })
  })

  it('exports default openapiPipeline function', () => {
    expect(kyTsModule.default).toBeDefined()
    expect(typeof kyTsModule.default).toBe('function')
  })

  it('exports config, parser, compiler, generate, dest, original', () => {
    expect(kyTsModule).toHaveProperty('config')
    expect(kyTsModule).toHaveProperty('parser')
    expect(kyTsModule).toHaveProperty('compiler')
    expect(kyTsModule).toHaveProperty('generate')
    expect(kyTsModule).toHaveProperty('dest')
    expect(kyTsModule).toHaveProperty('original')
    expect(typeof kyTsModule.config).toBe('function')
    expect(typeof kyTsModule.parser).toBe('function')
    expect(typeof kyTsModule.compiler).toBe('function')
    expect(typeof kyTsModule.generate).toBe('function')
    expect(typeof kyTsModule.dest).toBe('function')
    expect(typeof kyTsModule.original).toBe('function')
  })

  it('openapiPipeline has config, parser, compiler, generate, dest, original methods', () => {
    expect(kyTsModule.default).toHaveProperty('config')
    expect(kyTsModule.default).toHaveProperty('parser')
    expect(kyTsModule.default).toHaveProperty('compiler')
    expect(kyTsModule.default).toHaveProperty('generate')
    expect(kyTsModule.default).toHaveProperty('dest')
    expect(kyTsModule.default).toHaveProperty('original')
    expect(typeof kyTsModule.default.config).toBe('function')
    expect(typeof kyTsModule.default.parser).toBe('function')
    expect(typeof kyTsModule.default.compiler).toBe('function')
    expect(typeof kyTsModule.default.generate).toBe('function')
    expect(typeof kyTsModule.default.dest).toBe('function')
    expect(typeof kyTsModule.default.original).toBe('function')
  })

  it('openapiPipeline can be called with source', async () => {
    const source = parseOpenapiSpecification(swagger2Minimal)
    const result = await kyTsModule.default({
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
