import { describe, expect, it } from 'vitest'
import { defineConfig } from '../../src/config'

describe('defineConfig', () => {
  it('returns same config object (single-service)', () => {
    const config = {
      preset: 'swag-axios-ts',
      input: 'https://api.example.com/openapi.json',
      output: { main: 'src/api.ts', type: 'src/api.type.ts' },
    }
    expect(defineConfig(config)).toBe(config)
    expect(defineConfig(config)).toEqual(config)
  })

  it('returns same config object (with servers)', () => {
    const config = {
      preset: 'swag-axios-ts',
      servers: [
        { input: { uri: 'https://a.com' }, output: { main: 'a.ts' } },
        { input: { uri: 'https://b.com' }, output: { main: 'b.ts' } },
      ],
    }
    expect(defineConfig(config)).toBe(config)
    expect(defineConfig(config)).toEqual(config)
  })
})
