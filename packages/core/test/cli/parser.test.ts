import { describe, expect, it } from 'vitest'
import { options, servers } from '../../src/cli/parser'

describe('parser.options', () => {
  it('returns empty object when no options', () => {
    expect(options({})).toEqual({})
  })

  it('sets pipeline from --pipe', () => {
    expect(options({ pipe: 'swag-axios-ts' })).toEqual({ pipeline: 'swag-axios-ts' })
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

describe('parser.servers', () => {
  it('wraps single config with input into one server', () => {
    const config = {
      pipeline: 'swag-axios-ts',
      input: { uri: 'https://api.example.com' },
      output: { main: 'out.ts' },
    }
    const result = servers(config as any)
    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      pipeline: 'swag-axios-ts',
      input: { uri: 'https://api.example.com' },
      output: { main: 'out.ts' },
    })
  })

  it('expands servers array and merges base config', () => {
    const config = {
      pipeline: 'swag-axios-ts',
      servers: [
        { input: { uri: 'https://a.com' }, output: { main: 'a.ts' } },
        { input: { uri: 'https://b.com' }, output: { main: 'b.ts' } },
      ],
    }
    const result = servers(config as any)
    expect(result).toHaveLength(2)
    expect(result[0]).toMatchObject({ pipeline: 'swag-axios-ts', input: { uri: 'https://a.com' }, output: { main: 'a.ts' } })
    expect(result[1]).toMatchObject({ pipeline: 'swag-axios-ts', input: { uri: 'https://b.com' }, output: { main: 'b.ts' } })
  })

  it('initializes empty servers when servers undefined', () => {
    const config = {
      pipeline: 'swag-axios-ts',
      input: { json: './swagger.json' },
    }
    const result = servers(config as any)
    expect(result).toHaveLength(1)
    expect(result[0].input).toEqual({ json: './swagger.json' })
  })
})
