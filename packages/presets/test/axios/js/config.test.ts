import { describe, expect, it } from 'vitest'
import { config } from '../../../src/axios/js/config'

describe('axios/js config', () => {
  it('sets default http import to axios', () => {
    const configRead = config({
      input: 'test.json',
    } as any)

    const axiosImport = configRead.graphs.scopes.main.imports.find(i => i.name === 'http')
    expect(axiosImport).toBeDefined()
    expect(axiosImport?.value).toBe('axios')
  })

  it('sets default output to src/api/index.js', () => {
    const configRead = config({
      input: 'test.json',
    } as any)

    expect(configRead.config.output).toEqual({ main: 'src/api/index.js', type: 'src/api/index.type.ts' })
  })

  it('respects custom output', () => {
    const configRead = config({
      input: 'test.json',
      output: 'custom/api.js',
    } as any)

    expect(configRead.config.output).toEqual({ main: 'custom/api.js', type: 'custom/api.type.ts' })
  })

  it('respects custom http import', () => {
    const configRead = config({
      input: 'test.json',
      meta: {
        import: {
          http: 'custom-axios',
        },
      },
    } as any)

    const customImport = configRead.graphs.scopes.main.imports.find(i => i.name === 'http')
    expect(customImport).toBeDefined()
    expect(customImport?.value).toBe('custom-axios')
  })
})
