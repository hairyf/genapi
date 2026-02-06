import { parseOpenapiSpecification } from '@genapi/parser'
import { provide } from '@genapi/shared'
import { beforeEach, describe, expect, it } from 'vitest'

import { swagger2Minimal } from '../../../../parser/test/fixtures/swagger2-minimal'
import * as tanstackReactModule from '../../../src/tanstack/react'

describe('presets/src/tanstack/react', () => {
  beforeEach(() => {
    provide({ interfaces: [], functions: [], configRead: undefined })
  })

  it('exports default openapiPipeline function', () => {
    expect(tanstackReactModule.default).toBeDefined()
    expect(typeof tanstackReactModule.default).toBe('function')
  })

  it('exports config, parser, compiler, generate, dest, original', () => {
    expect(tanstackReactModule).toHaveProperty('config')
    expect(tanstackReactModule).toHaveProperty('parser')
    expect(tanstackReactModule).toHaveProperty('compiler')
    expect(tanstackReactModule).toHaveProperty('generate')
    expect(tanstackReactModule).toHaveProperty('dest')
    expect(tanstackReactModule).toHaveProperty('original')
    expect(typeof tanstackReactModule.config).toBe('function')
    expect(typeof tanstackReactModule.parser).toBe('function')
    expect(typeof tanstackReactModule.compiler).toBe('function')
    expect(typeof tanstackReactModule.generate).toBe('function')
    expect(typeof tanstackReactModule.dest).toBe('function')
    expect(typeof tanstackReactModule.original).toBe('function')
  })

  it('openapiPipeline has config, parser, compiler, generate, dest, original methods', () => {
    expect(tanstackReactModule.default).toHaveProperty('config')
    expect(tanstackReactModule.default).toHaveProperty('parser')
    expect(tanstackReactModule.default).toHaveProperty('compiler')
    expect(tanstackReactModule.default).toHaveProperty('generate')
    expect(tanstackReactModule.default).toHaveProperty('dest')
    expect(tanstackReactModule.default).toHaveProperty('original')
    expect(typeof tanstackReactModule.default.config).toBe('function')
    expect(typeof tanstackReactModule.default.parser).toBe('function')
    expect(typeof tanstackReactModule.default.compiler).toBe('function')
    expect(typeof tanstackReactModule.default.generate).toBe('function')
    expect(typeof tanstackReactModule.default.dest).toBe('function')
    expect(typeof tanstackReactModule.default.original).toBe('function')
  })

  it('openapiPipeline can be called with source', async () => {
    const source = parseOpenapiSpecification(swagger2Minimal)
    const result = await tanstackReactModule.default({
      input: { json: source },
      output: { main: 'test/fixtures/generated/tanstack-react-output.ts', type: false },
    } as any)
    expect(result).toBeUndefined()
  })
})
