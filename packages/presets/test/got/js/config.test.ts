import { describe, expect, it } from 'vitest'
import { config } from '../../../src/got/js/config'

describe('got/js config', () => {
  it('sets default http import to got', () => {
    const configRead = config({
      input: 'test.json',
    } as any)

    const gotImport = configRead.graphs.imports.find(i => i.name === 'http')
    expect(gotImport).toBeDefined()
    expect(gotImport?.value).toBe('got')
  })

  it('sets default output to src/api/index.js', () => {
    const configRead = config({
      input: 'test.json',
    } as any)

    expect(configRead.config.output).toEqual({ main: 'src/api/index.js', type: 'src/api/index.type.ts' })
  })

  it('respects custom http import', () => {
    const configRead = config({
      input: 'test.json',
      meta: {
        import: {
          http: 'custom-got',
        },
      },
    } as any)

    const customImport = configRead.graphs.imports.find(i => i.name === 'http')
    expect(customImport).toBeDefined()
    expect(customImport?.value).toBe('custom-got')
  })
})
