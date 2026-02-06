import { parseOpenapiSpecification } from '@genapi/parser'
import { provide } from '@genapi/shared'
import { describe, expect, it } from 'vitest'

import { swagger2Minimal } from '../../../parser/test/fixtures/swagger2-minimal'
import * as tanstackModule from '../../src/tanstack'

describe('presets/src/tanstack', () => {
  it('exports react preset', () => {
    expect(tanstackModule).toHaveProperty('react')
    expect(tanstackModule.react).toBeDefined()
  })

  it('exports vue preset', () => {
    expect(tanstackModule).toHaveProperty('vue')
    expect(tanstackModule.vue).toBeDefined()
  })

  it('react preset has config, parser, compiler, generate, dest, original', () => {
    expect(tanstackModule.react).toHaveProperty('config')
    expect(tanstackModule.react).toHaveProperty('parser')
    expect(tanstackModule.react).toHaveProperty('compiler')
    expect(tanstackModule.react).toHaveProperty('generate')
    expect(tanstackModule.react).toHaveProperty('dest')
    expect(tanstackModule.react).toHaveProperty('original')
    expect(typeof tanstackModule.react.config).toBe('function')
    expect(typeof tanstackModule.react.parser).toBe('function')
    expect(typeof tanstackModule.react.compiler).toBe('function')
    expect(typeof tanstackModule.react.generate).toBe('function')
    expect(typeof tanstackModule.react.dest).toBe('function')
    expect(typeof tanstackModule.react.original).toBe('function')
  })

  it('vue preset has config, parser, compiler, generate, dest, original', () => {
    expect(tanstackModule.vue).toHaveProperty('config')
    expect(tanstackModule.vue).toHaveProperty('parser')
    expect(tanstackModule.vue).toHaveProperty('compiler')
    expect(tanstackModule.vue).toHaveProperty('generate')
    expect(tanstackModule.vue).toHaveProperty('dest')
    expect(tanstackModule.vue).toHaveProperty('original')
    expect(typeof tanstackModule.vue.config).toBe('function')
    expect(typeof tanstackModule.vue.parser).toBe('function')
    expect(typeof tanstackModule.vue.compiler).toBe('function')
    expect(typeof tanstackModule.vue.generate).toBe('function')
    expect(typeof tanstackModule.vue.dest).toBe('function')
    expect(typeof tanstackModule.vue.original).toBe('function')
  })

  it('react preset can be called as function', async () => {
    provide({ interfaces: [], functions: [], configRead: undefined })
    const source = parseOpenapiSpecification(swagger2Minimal)
    const result = await tanstackModule.react({
      input: { json: source },
      output: { main: 'test/fixtures/generated/tanstack-react-output.ts', type: false },
    } as any)
    expect(result).toBeUndefined()
  })

  it('vue preset can be called as function', async () => {
    provide({ interfaces: [], functions: [], configRead: undefined })
    const source = parseOpenapiSpecification(swagger2Minimal)
    const result = await tanstackModule.vue({
      input: { json: source },
      output: { main: 'test/fixtures/generated/tanstack-vue-output.ts', type: false },
    } as any)
    expect(result).toBeUndefined()
  })
})
