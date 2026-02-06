import fs from 'fs-extra'
import { describe, expect, it, vi } from 'vitest'
import { getVersion, options, servers } from '../../src/cli/parser'

describe('parser.options', () => {
  it('returns empty object when no options', () => {
    expect(options({})).toEqual({})
  })

  it('sets preset from --preset', () => {
    expect(options({ preset: 'swag-axios-ts' })).toEqual({ preset: 'swag-axios-ts' })
  })

  it('sets input as uri when input is network URL', () => {
    expect(options({ input: 'https://api.example.com/openapi.json' })).toEqual({
      input: { uri: 'https://api.example.com/openapi.json' },
    })
  })

  it('sets input as json when input is not URL', () => {
    expect(options({ input: './swagger.json' })).toEqual({
      input: { json: './swagger.json' },
    })
  })

  it('sets output when input and outfile provided', () => {
    expect(options({ input: './swagger.json', outfile: 'src/api.ts' })).toEqual({
      input: { json: './swagger.json' },
      output: { main: 'src/api.ts' },
    })
  })

  it('ignores outfile when input not provided', () => {
    expect(options({ outfile: 'src/api.ts' })).toEqual({})
  })
})

describe('parser.getVersion', () => {
  it('returns version string when package.json exists', () => {
    const version = getVersion()
    expect(typeof version).toBe('string')
    expect(version).toMatch(/^\d+\.\d+\.\d+/)
  })

  it('returns 0.0.0 when package.json does not exist', () => {
    // Mock fs.existsSync to return false
    vi.spyOn(fs, 'existsSync').mockReturnValue(false)
    const version = getVersion()
    expect(version).toBe('0.0.0')
    vi.restoreAllMocks()
  })
})

describe('parser.servers', () => {
  it('returns empty array when config is undefined', () => {
    expect(servers(undefined)).toEqual([])
  })

  it('wraps single config with input into one server', () => {
    const config = {
      preset: 'swag-axios-ts',
      input: { uri: 'https://api.example.com' },
      output: { main: 'out.ts' },
    }
    const result = servers(config as any)
    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      preset: 'swag-axios-ts',
      input: { uri: 'https://api.example.com' },
      output: { main: 'out.ts' },
    })
  })

  it('expands servers array and merges base config', () => {
    const config = {
      preset: 'swag-axios-ts',
      servers: [
        { input: { uri: 'https://a.com' }, output: { main: 'a.ts' } },
        { input: { uri: 'https://b.com' }, output: { main: 'b.ts' } },
      ],
    }
    const result = servers(config as any)
    expect(result).toHaveLength(2)
    expect(result[0]).toMatchObject({ preset: 'swag-axios-ts', input: { uri: 'https://a.com' }, output: { main: 'a.ts' } })
    expect(result[1]).toMatchObject({ preset: 'swag-axios-ts', input: { uri: 'https://b.com' }, output: { main: 'b.ts' } })
  })

  it('initializes empty servers when servers undefined', () => {
    const config = {
      preset: 'swag-axios-ts',
      input: { json: './swagger.json' },
    }
    const result = servers(config as any)
    expect(result).toHaveLength(1)
    expect(result[0].input).toEqual({ json: './swagger.json' })
  })

  it('handles config with servers already defined', () => {
    const config = {
      preset: 'swag-axios-ts',
      servers: [
        { input: { uri: 'https://a.com' } },
      ],
    }
    const result = servers(config as any)
    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({ preset: 'swag-axios-ts', input: { uri: 'https://a.com' } })
  })

  it('merges base config properties into each server', () => {
    const config = {
      preset: 'swag-axios-ts',
      meta: { baseURL: 'https://api.example.com' },
      servers: [
        { input: { uri: 'https://a.com' } },
        { input: { uri: 'https://b.com' } },
      ],
    }
    const result = servers(config as any)
    expect(result).toHaveLength(2)
    expect(result[0].preset).toBe('swag-axios-ts')
    expect(result[0].meta).toEqual({ baseURL: 'https://api.example.com' })
    expect(result[1].preset).toBe('swag-axios-ts')
    expect(result[1].meta).toEqual({ baseURL: 'https://api.example.com' })
  })
})
