import { parseOpenapiSpecification } from '@genapi/parser'
import { provide } from '@genapi/shared'
import { beforeEach, describe, expect, it } from 'vitest'

import { swagger2Minimal } from '../../../../parser/test/fixtures/swagger2-minimal'
import * as tanstackVueModule from '../../../src/tanstack/vue'

describe('presets/src/tanstack/vue', () => {
  beforeEach(() => {
    provide({ interfaces: [], functions: [], configRead: undefined })
  })

  it('exports default openapiPipeline function', () => {
    expect(tanstackVueModule.default).toBeDefined()
    expect(typeof tanstackVueModule.default).toBe('function')
  })

  it('exports config, parser, compiler, generate, dest, original', () => {
    expect(tanstackVueModule).toHaveProperty('config')
    expect(tanstackVueModule).toHaveProperty('parser')
    expect(tanstackVueModule).toHaveProperty('compiler')
    expect(tanstackVueModule).toHaveProperty('generate')
    expect(tanstackVueModule).toHaveProperty('dest')
    expect(tanstackVueModule).toHaveProperty('original')
    expect(typeof tanstackVueModule.config).toBe('function')
    expect(typeof tanstackVueModule.parser).toBe('function')
    expect(typeof tanstackVueModule.compiler).toBe('function')
    expect(typeof tanstackVueModule.generate).toBe('function')
    expect(typeof tanstackVueModule.dest).toBe('function')
    expect(typeof tanstackVueModule.original).toBe('function')
  })

  it('openapiPipeline has config, parser, compiler, generate, dest, original methods', () => {
    expect(tanstackVueModule.default).toHaveProperty('config')
    expect(tanstackVueModule.default).toHaveProperty('parser')
    expect(tanstackVueModule.default).toHaveProperty('compiler')
    expect(tanstackVueModule.default).toHaveProperty('generate')
    expect(tanstackVueModule.default).toHaveProperty('dest')
    expect(tanstackVueModule.default).toHaveProperty('original')
    expect(typeof tanstackVueModule.default.config).toBe('function')
    expect(typeof tanstackVueModule.default.parser).toBe('function')
    expect(typeof tanstackVueModule.default.compiler).toBe('function')
    expect(typeof tanstackVueModule.default.generate).toBe('function')
    expect(typeof tanstackVueModule.default.dest).toBe('function')
    expect(typeof tanstackVueModule.default.original).toBe('function')
  })

  it('openapiPipeline can be called with source', async () => {
    const source = parseOpenapiSpecification(swagger2Minimal)
    const result = await tanstackVueModule.default({
      input: { json: source },
      output: { main: 'test/fixtures/generated/tanstack-vue-output.ts', type: false },
    } as any)
    expect(result).toBeUndefined()
  })
})
