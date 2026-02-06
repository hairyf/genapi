import { describe, expect, it } from 'vitest'
import { config } from '../../../src/uni/js/config'

describe('uni/js config', () => {
  it('sets default http import to @uni-helper/uni-network', () => {
    const configRead = config({
      input: 'test.json',
    } as any)

    const uniImport = configRead.graphs.imports.find(i => i.name === 'http')
    expect(uniImport).toBeDefined()
    expect(uniImport?.value).toBe('@uni-helper/uni-network')
  })

  it('sets default output to src/api/index.js when output is undefined', () => {
    const configRead = config({
      input: 'test.json',
    } as any)

    expect(configRead.config.output).toEqual({ main: 'src/api/index.js', type: 'src/api/index.type.ts' })
  })

  it('sets default output to src/api/index.js when output is empty object', () => {
    const configRead = config({
      input: 'test.json',
      output: {},
    } as any)

    expect(configRead.config.output).toEqual({ main: 'src/api/index.js', type: 'src/api/index.type.ts' })
  })

  it('respects custom http import', () => {
    const configRead = config({
      input: 'test.json',
      meta: {
        import: {
          http: 'custom-uni',
        },
      },
    } as any)

    const customImport = configRead.graphs.imports.find(i => i.name === 'http')
    expect(customImport).toBeDefined()
    expect(customImport?.value).toBe('custom-uni')
  })

  it('handles missing meta object', () => {
    const configRead = config({
      input: 'test.json',
    } as any)

    expect(configRead.config.meta).toBeDefined()
    expect(configRead.config.meta?.import).toBeDefined()
    expect(configRead.config.meta?.import?.http).toBe('@uni-helper/uni-network')
  })

  it('handles missing meta.import object', () => {
    const configRead = config({
      input: 'test.json',
      meta: {},
    } as any)

    expect(configRead.config.meta?.import).toBeDefined()
    expect(configRead.config.meta?.import?.http).toBe('@uni-helper/uni-network')
  })
})
