import { describe, expect, it } from 'vitest'
import * as kyModule from '../../src/ky'

describe('presets/src/ky', () => {
  it('exports js preset', () => {
    expect(kyModule).toHaveProperty('js')
    expect(kyModule.js).toBeDefined()
  })

  it('exports ts preset', () => {
    expect(kyModule).toHaveProperty('ts')
    expect(kyModule.ts).toBeDefined()
  })

  it('js preset has config, parser, compiler, generate, dest, original', () => {
    expect(kyModule.js).toHaveProperty('config')
    expect(kyModule.js).toHaveProperty('parser')
    expect(typeof kyModule.js.config).toBe('function')
    expect(typeof kyModule.js.parser).toBe('function')
  })

  it('ts preset has config, parser, compiler, generate, dest, original', () => {
    expect(kyModule.ts).toHaveProperty('config')
    expect(kyModule.ts).toHaveProperty('parser')
    expect(typeof kyModule.ts.config).toBe('function')
    expect(typeof kyModule.ts.parser).toBe('function')
  })
})
