import { describe, expect, it } from 'vitest'
import * as axiosModule from '../../src/axios'

describe('presets/src/axios', () => {
  it('exports js preset', () => {
    expect(axiosModule).toHaveProperty('js')
    expect(axiosModule.js).toBeDefined()
  })

  it('exports ts preset', () => {
    expect(axiosModule).toHaveProperty('ts')
    expect(axiosModule.ts).toBeDefined()
  })

  it('js preset has config, parser, compiler, generate, dest, original', () => {
    expect(axiosModule.js).toHaveProperty('config')
    expect(axiosModule.js).toHaveProperty('parser')
    expect(axiosModule.js).toHaveProperty('compiler')
    expect(axiosModule.js).toHaveProperty('generate')
    expect(axiosModule.js).toHaveProperty('dest')
    expect(axiosModule.js).toHaveProperty('original')
    expect(typeof axiosModule.js.config).toBe('function')
    expect(typeof axiosModule.js.parser).toBe('function')
  })

  it('ts preset has config, parser, compiler, generate, dest, original', () => {
    expect(axiosModule.ts).toHaveProperty('config')
    expect(axiosModule.ts).toHaveProperty('parser')
    expect(axiosModule.ts).toHaveProperty('compiler')
    expect(axiosModule.ts).toHaveProperty('generate')
    expect(axiosModule.ts).toHaveProperty('dest')
    expect(axiosModule.ts).toHaveProperty('original')
    expect(typeof axiosModule.ts.config).toBe('function')
    expect(typeof axiosModule.ts.parser).toBe('function')
  })
})
