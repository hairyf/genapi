import { describe, expect, it } from 'vitest'
import * as gotModule from '../../src/got'

describe('presets/src/got', () => {
  it('exports js preset', () => {
    expect(gotModule).toHaveProperty('js')
    expect(gotModule.js).toBeDefined()
  })

  it('exports ts preset', () => {
    expect(gotModule).toHaveProperty('ts')
    expect(gotModule.ts).toBeDefined()
  })

  it('js preset has config, parser, compiler, generate, dest, original', () => {
    expect(gotModule.js).toHaveProperty('config')
    expect(gotModule.js).toHaveProperty('parser')
    expect(typeof gotModule.js.config).toBe('function')
    expect(typeof gotModule.js.parser).toBe('function')
  })

  it('ts preset has config, parser, compiler, generate, dest, original', () => {
    expect(gotModule.ts).toHaveProperty('config')
    expect(gotModule.ts).toHaveProperty('parser')
    expect(typeof gotModule.ts.config).toBe('function')
    expect(typeof gotModule.ts.parser).toBe('function')
  })
})
