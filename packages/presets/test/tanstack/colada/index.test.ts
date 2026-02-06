import { parseOpenapiSpecification } from '@genapi/parser'
import { provide } from '@genapi/shared'
import { beforeEach, describe, expect, it } from 'vitest'

import { swagger2Minimal } from '../../../../parser/test/fixtures/swagger2-minimal'
import * as coladaModule from '../../../src/tanstack/colada'

describe('presets/src/tanstack/colada', () => {
  beforeEach(() => {
    provide({ interfaces: [], functions: [], configRead: undefined })
  })

  it('exports default openapiPipeline function', () => {
    expect(coladaModule.default).toBeDefined()
    expect(typeof coladaModule.default).toBe('function')
  })

  it('exports config, parser, compiler, generate, dest, original', () => {
    expect(coladaModule).toHaveProperty('config')
    expect(coladaModule).toHaveProperty('parser')
    expect(coladaModule).toHaveProperty('compiler')
    expect(coladaModule).toHaveProperty('generate')
    expect(coladaModule).toHaveProperty('dest')
    expect(coladaModule).toHaveProperty('original')
    expect(typeof coladaModule.config).toBe('function')
    expect(typeof coladaModule.parser).toBe('function')
    expect(typeof coladaModule.compiler).toBe('function')
    expect(typeof coladaModule.generate).toBe('function')
    expect(typeof coladaModule.dest).toBe('function')
    expect(typeof coladaModule.original).toBe('function')
  })

  it('openapiPipeline can be called with source', async () => {
    const source = parseOpenapiSpecification(swagger2Minimal)
    const result = await coladaModule.default({
      input: { json: source },
      output: { main: 'test/fixtures/generated/colada-output.ts', type: false },
    } as any)
    expect(result).toBeUndefined()
  })
})
