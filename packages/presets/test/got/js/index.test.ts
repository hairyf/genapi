import { parseOpenapiSpecification } from '@genapi/parser'
import { provide } from '@genapi/shared'
import { beforeEach, describe, expect, it } from 'vitest'

import { swagger2Minimal } from '../../../../parser/test/fixtures/swagger2-minimal'
import * as gotJsModule from '../../../src/got/js'

describe('presets/src/got/js', () => {
  beforeEach(() => {
    provide({ interfaces: [], functions: [], configRead: undefined })
  })

  it('exports default openapiPipeline function', () => {
    expect(gotJsModule.default).toBeDefined()
    expect(typeof gotJsModule.default).toBe('function')
  })

  it('exports config, parser, compiler, generate, dest, original', () => {
    expect(gotJsModule).toHaveProperty('config')
    expect(gotJsModule).toHaveProperty('parser')
    expect(gotJsModule).toHaveProperty('compiler')
    expect(gotJsModule).toHaveProperty('generate')
    expect(gotJsModule).toHaveProperty('dest')
    expect(gotJsModule).toHaveProperty('original')
    expect(typeof gotJsModule.config).toBe('function')
    expect(typeof gotJsModule.parser).toBe('function')
    expect(typeof gotJsModule.compiler).toBe('function')
    expect(typeof gotJsModule.generate).toBe('function')
    expect(typeof gotJsModule.dest).toBe('function')
    expect(typeof gotJsModule.original).toBe('function')
  })

  it('openapiPipeline has config, parser, compiler, generate, dest, original methods', () => {
    expect(gotJsModule.default).toHaveProperty('config')
    expect(gotJsModule.default).toHaveProperty('parser')
    expect(gotJsModule.default).toHaveProperty('compiler')
    expect(gotJsModule.default).toHaveProperty('generate')
    expect(gotJsModule.default).toHaveProperty('dest')
    expect(gotJsModule.default).toHaveProperty('original')
    expect(typeof gotJsModule.default.config).toBe('function')
    expect(typeof gotJsModule.default.parser).toBe('function')
    expect(typeof gotJsModule.default.compiler).toBe('function')
    expect(typeof gotJsModule.default.generate).toBe('function')
    expect(typeof gotJsModule.default.dest).toBe('function')
    expect(typeof gotJsModule.default.original).toBe('function')
  })

  it('openapiPipeline can be called with source', async () => {
    const source = parseOpenapiSpecification(swagger2Minimal)
    const result = await gotJsModule.default({
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
