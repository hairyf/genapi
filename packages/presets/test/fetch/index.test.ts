import { describe, expect, it } from 'vitest'
import * as fetchModule from '../../src/fetch'

describe('presets/src/fetch', () => {
  it('exports js preset', () => {
    expect(fetchModule).toHaveProperty('js')
    expect(fetchModule.js).toBeDefined()
  })

  it('exports ts preset', () => {
    expect(fetchModule).toHaveProperty('ts')
    expect(fetchModule.ts).toBeDefined()
  })

  it('js preset has config, parser, compiler, generate, dest, original', () => {
    expect(fetchModule.js).toHaveProperty('config')
    expect(fetchModule.js).toHaveProperty('parser')
    expect(typeof fetchModule.js.config).toBe('function')
    expect(typeof fetchModule.js.parser).toBe('function')
  })

  it('ts preset has config, parser, compiler, generate, dest, original', () => {
    expect(fetchModule.ts).toHaveProperty('config')
    expect(fetchModule.ts).toHaveProperty('parser')
    expect(typeof fetchModule.ts.config).toBe('function')
    expect(typeof fetchModule.ts.parser).toBe('function')
  })
})
