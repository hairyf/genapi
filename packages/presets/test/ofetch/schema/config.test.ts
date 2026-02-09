import { describe, expect, it } from 'vitest'
import { config } from '../../../src/ofetch/schema/index'

describe('ofetch/schema config', () => {
  it('sets default http import to ofetch', () => {
    const configRead = config({
      input: 'test.json',
    } as any)

    const ofetchImport = configRead.graphs.scopes.main.imports.find(i => i.names?.includes('ofetch'))
    expect(ofetchImport).toBeDefined()
    expect(ofetchImport?.value).toBe('ofetch')
  })

  it('adds fetchdts type imports', () => {
    const configRead = config({
      input: 'test.json',
    } as any)

    const fetchdtsImport = configRead.graphs.scopes.main.imports.find(
      i => i.value === 'fetchdts' && i.names?.includes('TypedFetchInput'),
    )
    expect(fetchdtsImport).toBeDefined()
    expect(fetchdtsImport?.names).toContain('TypedFetchInput')
    expect(fetchdtsImport?.names).toContain('TypedFetchRequestInit')
    expect(fetchdtsImport?.names).toContain('TypedFetchResponseBody')
    expect(fetchdtsImport?.names).toContain('TypedResponse')
    expect(fetchdtsImport?.names).toContain('Endpoint')
    expect(fetchdtsImport?.names).toContain('DynamicParam')
  })

  it('respects custom http import', () => {
    const configRead = config({
      input: 'test.json',
      meta: {
        import: {
          http: 'custom-fetch',
        },
      },
    } as any)

    const customImport = configRead.graphs.scopes.main.imports.find(i => i.names?.includes('ofetch'))
    expect(customImport).toBeDefined()
    expect(customImport?.value).toBe('custom-fetch')
  })
})
