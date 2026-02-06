import { parseOpenapiSpecification } from '@genapi/parser'
import { provide } from '@genapi/shared'
import { beforeEach, describe, expect, it } from 'vitest'

import { swagger2Minimal } from '../../../../parser/test/fixtures/swagger2-minimal'
import * as ofetchSchemaModule from '../../../src/ofetch/schema'

describe('presets/src/ofetch/schema', () => {
  beforeEach(() => {
    provide({ interfaces: [], functions: [], configRead: undefined })
  })

  it('exports default openapiPipeline function', () => {
    expect(ofetchSchemaModule.default).toBeDefined()
    expect(typeof ofetchSchemaModule.default).toBe('function')
  })

  it('exports config, parser, compiler, generate, dest, original', () => {
    expect(ofetchSchemaModule).toHaveProperty('config')
    expect(ofetchSchemaModule).toHaveProperty('parser')
    expect(ofetchSchemaModule).toHaveProperty('compiler')
    expect(ofetchSchemaModule).toHaveProperty('generate')
    expect(ofetchSchemaModule).toHaveProperty('dest')
    expect(ofetchSchemaModule).toHaveProperty('original')
    expect(typeof ofetchSchemaModule.config).toBe('function')
    expect(typeof ofetchSchemaModule.parser).toBe('function')
    expect(typeof ofetchSchemaModule.compiler).toBe('function')
    expect(typeof ofetchSchemaModule.generate).toBe('function')
    expect(typeof ofetchSchemaModule.dest).toBe('function')
    expect(typeof ofetchSchemaModule.original).toBe('function')
  })

  it('openapiPipeline has config, parser, compiler, generate, dest, original methods', () => {
    expect(ofetchSchemaModule.default).toHaveProperty('config')
    expect(ofetchSchemaModule.default).toHaveProperty('parser')
    expect(ofetchSchemaModule.default).toHaveProperty('compiler')
    expect(ofetchSchemaModule.default).toHaveProperty('generate')
    expect(ofetchSchemaModule.default).toHaveProperty('dest')
    expect(ofetchSchemaModule.default).toHaveProperty('original')
    expect(typeof ofetchSchemaModule.default.config).toBe('function')
    expect(typeof ofetchSchemaModule.default.parser).toBe('function')
    expect(typeof ofetchSchemaModule.default.compiler).toBe('function')
    expect(typeof ofetchSchemaModule.default.generate).toBe('function')
    expect(typeof ofetchSchemaModule.default.dest).toBe('function')
    expect(typeof ofetchSchemaModule.default.original).toBe('function')
  })

  it('openapiPipeline can be called with source', async () => {
    const source = parseOpenapiSpecification(swagger2Minimal)
    const result = await ofetchSchemaModule.default({
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
