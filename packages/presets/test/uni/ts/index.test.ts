import { parseOpenapiSpecification } from '@genapi/parser'
import { provide } from '@genapi/shared'
import { beforeEach, describe, expect, it } from 'vitest'

import { swagger2Minimal } from '../../../../parser/test/fixtures/swagger2-minimal'
import * as uniTsModule from '../../../src/uni/ts'

describe('presets/src/uni/ts', () => {
  beforeEach(() => {
    provide({ interfaces: [], functions: [], configRead: undefined })
  })

  it('exports default openapiPipeline function', () => {
    expect(uniTsModule.default).toBeDefined()
    expect(typeof uniTsModule.default).toBe('function')
  })

  it('exports config, parser, compiler, generate, dest, original', () => {
    expect(uniTsModule).toHaveProperty('config')
    expect(uniTsModule).toHaveProperty('parser')
    expect(uniTsModule).toHaveProperty('compiler')
    expect(uniTsModule).toHaveProperty('generate')
    expect(uniTsModule).toHaveProperty('dest')
    expect(uniTsModule).toHaveProperty('original')
    expect(typeof uniTsModule.config).toBe('function')
    expect(typeof uniTsModule.parser).toBe('function')
    expect(typeof uniTsModule.compiler).toBe('function')
    expect(typeof uniTsModule.generate).toBe('function')
    expect(typeof uniTsModule.dest).toBe('function')
    expect(typeof uniTsModule.original).toBe('function')
  })

  it('openapiPipeline has config, parser, compiler, generate, dest, original methods', () => {
    expect(uniTsModule.default).toHaveProperty('config')
    expect(uniTsModule.default).toHaveProperty('parser')
    expect(uniTsModule.default).toHaveProperty('compiler')
    expect(uniTsModule.default).toHaveProperty('generate')
    expect(uniTsModule.default).toHaveProperty('dest')
    expect(uniTsModule.default).toHaveProperty('original')
    expect(typeof uniTsModule.default.config).toBe('function')
    expect(typeof uniTsModule.default.parser).toBe('function')
    expect(typeof uniTsModule.default.compiler).toBe('function')
    expect(typeof uniTsModule.default.generate).toBe('function')
    expect(typeof uniTsModule.default.dest).toBe('function')
    expect(typeof uniTsModule.default.original).toBe('function')
  })

  it('openapiPipeline can be called with source', async () => {
    const source = parseOpenapiSpecification(swagger2Minimal)
    const result = await uniTsModule.default({
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
