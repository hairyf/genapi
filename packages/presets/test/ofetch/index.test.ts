import { describe, expect, it } from 'vitest'
import * as ofetchModule from '../../src/ofetch'

describe('presets/src/ofetch', () => {
  it('exports js preset', () => {
    expect(ofetchModule).toHaveProperty('js')
    expect(ofetchModule.js).toBeDefined()
  })

  it('exports ts preset', () => {
    expect(ofetchModule).toHaveProperty('ts')
    expect(ofetchModule.ts).toBeDefined()
  })

  it('exports schema preset', () => {
    expect(ofetchModule).toHaveProperty('schema')
    expect(ofetchModule.schema).toBeDefined()
  })

  it('js preset has config, parser, compiler, generate, dest, original', () => {
    expect(ofetchModule.js).toHaveProperty('config')
    expect(ofetchModule.js).toHaveProperty('parser')
    expect(typeof ofetchModule.js.config).toBe('function')
    expect(typeof ofetchModule.js.parser).toBe('function')
  })

  it('ts preset has config, parser, compiler, generate, dest, original', () => {
    expect(ofetchModule.ts).toHaveProperty('config')
    expect(ofetchModule.ts).toHaveProperty('parser')
    expect(typeof ofetchModule.ts.config).toBe('function')
    expect(typeof ofetchModule.ts.parser).toBe('function')
  })

  it('schema preset has config, parser, compiler, generate, dest, original', () => {
    expect(ofetchModule.schema).toHaveProperty('config')
    expect(ofetchModule.schema).toHaveProperty('parser')
    expect(ofetchModule.schema).toHaveProperty('compiler')
    expect(typeof ofetchModule.schema.config).toBe('function')
    expect(typeof ofetchModule.schema.parser).toBe('function')
    expect(typeof ofetchModule.schema.compiler).toBe('function')
  })
})
