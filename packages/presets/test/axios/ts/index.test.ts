import { parseOpenapiSpecification } from '@genapi/parser'
import { provide } from '@genapi/shared'
import { beforeEach, describe, expect, it } from 'vitest'

import { swagger2Minimal } from '../../../../parser/test/fixtures/swagger2-minimal'
import * as axiosTsModule from '../../../src/axios/ts'

describe('presets/src/axios/ts', () => {
  beforeEach(() => {
    provide({ interfaces: { add: () => {}, values: () => [], all: () => [] }, functions: { add: () => {}, values: () => [], all: () => [] }, configRead: undefined })
  })

  it('exports default openapiPipeline function', () => {
    expect(axiosTsModule.default).toBeDefined()
    expect(typeof axiosTsModule.default).toBe('function')
  })

  it('exports config, parser, compiler, generate, dest, original', () => {
    expect(axiosTsModule).toHaveProperty('config')
    expect(axiosTsModule).toHaveProperty('parser')
    expect(axiosTsModule).toHaveProperty('compiler')
    expect(axiosTsModule).toHaveProperty('generate')
    expect(axiosTsModule).toHaveProperty('dest')
    expect(axiosTsModule).toHaveProperty('original')
    expect(typeof axiosTsModule.config).toBe('function')
    expect(typeof axiosTsModule.parser).toBe('function')
    expect(typeof axiosTsModule.compiler).toBe('function')
    expect(typeof axiosTsModule.generate).toBe('function')
    expect(typeof axiosTsModule.dest).toBe('function')
    expect(typeof axiosTsModule.original).toBe('function')
  })

  it('openapiPipeline has config, parser, compiler, generate, dest, original methods', () => {
    expect(axiosTsModule.default).toHaveProperty('config')
    expect(axiosTsModule.default).toHaveProperty('parser')
    expect(axiosTsModule.default).toHaveProperty('compiler')
    expect(axiosTsModule.default).toHaveProperty('generate')
    expect(axiosTsModule.default).toHaveProperty('dest')
    expect(axiosTsModule.default).toHaveProperty('original')
    expect(typeof axiosTsModule.default.config).toBe('function')
    expect(typeof axiosTsModule.default.parser).toBe('function')
    expect(typeof axiosTsModule.default.compiler).toBe('function')
    expect(typeof axiosTsModule.default.generate).toBe('function')
    expect(typeof axiosTsModule.default.dest).toBe('function')
    expect(typeof axiosTsModule.default.original).toBe('function')
  })

  it('openapiPipeline can be called with source', async () => {
    const source = parseOpenapiSpecification(swagger2Minimal)
    const result = await axiosTsModule.default({
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
