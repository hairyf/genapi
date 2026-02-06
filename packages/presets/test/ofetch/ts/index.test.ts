import { parseOpenapiSpecification } from '@genapi/parser'
import { provide } from '@genapi/shared'
import { beforeEach, describe, expect, it } from 'vitest'

import { swagger2Minimal } from '../../../../parser/test/fixtures/swagger2-minimal'
import * as ofetchTsModule from '../../../src/ofetch/ts'

describe('presets/src/ofetch/ts', () => {
  beforeEach(() => {
    provide({ interfaces: [], functions: [], configRead: undefined })
  })

  it('exports default openapiPipeline function', () => {
    expect(ofetchTsModule.default).toBeDefined()
    expect(typeof ofetchTsModule.default).toBe('function')
  })

  it('exports config, parser, compiler, generate, dest, original', () => {
    expect(ofetchTsModule).toHaveProperty('config')
    expect(ofetchTsModule).toHaveProperty('parser')
    expect(ofetchTsModule).toHaveProperty('compiler')
    expect(ofetchTsModule).toHaveProperty('generate')
    expect(ofetchTsModule).toHaveProperty('dest')
    expect(ofetchTsModule).toHaveProperty('original')
    expect(typeof ofetchTsModule.config).toBe('function')
    expect(typeof ofetchTsModule.parser).toBe('function')
    expect(typeof ofetchTsModule.compiler).toBe('function')
    expect(typeof ofetchTsModule.generate).toBe('function')
    expect(typeof ofetchTsModule.dest).toBe('function')
    expect(typeof ofetchTsModule.original).toBe('function')
  })

  it('openapiPipeline has config, parser, compiler, generate, dest, original methods', () => {
    expect(ofetchTsModule.default).toHaveProperty('config')
    expect(ofetchTsModule.default).toHaveProperty('parser')
    expect(ofetchTsModule.default).toHaveProperty('compiler')
    expect(ofetchTsModule.default).toHaveProperty('generate')
    expect(ofetchTsModule.default).toHaveProperty('dest')
    expect(ofetchTsModule.default).toHaveProperty('original')
    expect(typeof ofetchTsModule.default.config).toBe('function')
    expect(typeof ofetchTsModule.default.parser).toBe('function')
    expect(typeof ofetchTsModule.default.compiler).toBe('function')
    expect(typeof ofetchTsModule.default.generate).toBe('function')
    expect(typeof ofetchTsModule.default.dest).toBe('function')
    expect(typeof ofetchTsModule.default.original).toBe('function')
  })

  it('openapiPipeline can be called with source', async () => {
    const source = parseOpenapiSpecification(swagger2Minimal)
    const result = await ofetchTsModule.default({
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
