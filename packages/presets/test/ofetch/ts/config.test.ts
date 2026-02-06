import { describe, expect, it } from 'vitest'
import { config } from '../../../src/ofetch/ts/config'

describe('ofetch/ts config', () => {
  it('sets default http import to ofetch', () => {
    const configRead = config({
      input: 'test.json',
    } as any)

    const ofetchImport = configRead.graphs.imports.find(i => i.names?.includes('ofetch') || i.names?.includes('FetchOptions'))
    expect(ofetchImport).toBeDefined()
    expect(ofetchImport?.value).toBe('ofetch')
  })

  it('adds FetchOptions and ofetch imports when http is ofetch', () => {
    const configRead = config({
      input: 'test.json',
      meta: {
        import: {
          http: 'ofetch',
        },
      },
    } as any)

    const ofetchImport = configRead.graphs.imports.find(i => i.names?.includes('ofetch') && i.names?.includes('FetchOptions'))
    expect(ofetchImport).toBeDefined()
    expect(ofetchImport?.value).toBe('ofetch')
  })

  it('adds separate FetchOptions import when http is not ofetch', () => {
    const configRead = config({
      input: 'test.json',
      meta: {
        import: {
          http: 'custom-http',
        },
      },
    } as any)

    const customImport = configRead.graphs.imports.find(i => i.names?.includes('ofetch'))
    expect(customImport).toBeDefined()
    expect(customImport?.value).toBe('custom-http')

    const fetchOptionsImport = configRead.graphs.imports.find(i => i.names?.includes('FetchOptions') && i.value === 'ofetch')
    expect(fetchOptionsImport).toBeDefined()
  })
})
