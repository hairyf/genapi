import { describe, expect, it } from 'vitest'
import { config } from '../../../src/ofetch/js/config'

describe('ofetch/js config', () => {
  it('sets default http import to ofetch', () => {
    const configRead = config({
      input: 'test.json',
    } as any)

    const ofetchImport = configRead.graphs.scopes.main.imports.find(i => i.names?.includes('ofetch'))
    expect(ofetchImport).toBeDefined()
    expect(ofetchImport?.value).toBe('ofetch')
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
          http: 'custom-ofetch',
        },
      },
    } as any)

    const customImport = configRead.graphs.scopes.main.imports.find(i => i.names?.includes('ofetch'))
    expect(customImport).toBeDefined()
    expect(customImport?.value).toBe('custom-ofetch')
  })
})
