import { parseOpenapiSpecification } from '@genapi/parser'
import { provide } from '@genapi/shared'
import { beforeEach, describe, expect, it } from 'vitest'

import { swagger2Minimal } from '../../../../parser/test/fixtures/swagger2-minimal'
import * as axiosJsModule from '../../../src/axios/js'

describe('presets/src/axios/js', () => {
  beforeEach(() => {
    provide({ interfaces: [], functions: [], configRead: undefined })
  })

  it('exports default openapiPipeline function', () => {
    expect(axiosJsModule.default).toBeDefined()
    expect(typeof axiosJsModule.default).toBe('function')
  })

  it('exports config, parser, compiler, generate, dest, original', () => {
    expect(axiosJsModule).toHaveProperty('config')
    expect(axiosJsModule).toHaveProperty('parser')
    expect(axiosJsModule).toHaveProperty('compiler')
    expect(axiosJsModule).toHaveProperty('generate')
    expect(axiosJsModule).toHaveProperty('dest')
    expect(axiosJsModule).toHaveProperty('original')
    expect(typeof axiosJsModule.config).toBe('function')
    expect(typeof axiosJsModule.parser).toBe('function')
    expect(typeof axiosJsModule.compiler).toBe('function')
    expect(typeof axiosJsModule.generate).toBe('function')
    expect(typeof axiosJsModule.dest).toBe('function')
    expect(typeof axiosJsModule.original).toBe('function')
  })

  it('openapiPipeline has config, parser, compiler, generate, dest, original methods', () => {
    expect(axiosJsModule.default).toHaveProperty('config')
    expect(axiosJsModule.default).toHaveProperty('parser')
    expect(axiosJsModule.default).toHaveProperty('compiler')
    expect(axiosJsModule.default).toHaveProperty('generate')
    expect(axiosJsModule.default).toHaveProperty('dest')
    expect(axiosJsModule.default).toHaveProperty('original')
    expect(typeof axiosJsModule.default.config).toBe('function')
    expect(typeof axiosJsModule.default.parser).toBe('function')
    expect(typeof axiosJsModule.default.compiler).toBe('function')
    expect(typeof axiosJsModule.default.generate).toBe('function')
    expect(typeof axiosJsModule.default.dest).toBe('function')
    expect(typeof axiosJsModule.default.original).toBe('function')
  })

  it('openapiPipeline can be called with source', async () => {
    const source = parseOpenapiSpecification(swagger2Minimal)
    const result = await axiosJsModule.default({
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
