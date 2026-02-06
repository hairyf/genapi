import { describe, expect, it } from 'vitest'
import { config } from '../../../src/got/ts/config'

describe('got/ts config', () => {
  it('sets default http import to got', () => {
    const configRead = config({
      input: 'test.json',
    } as any)

    const gotImport = configRead.graphs.imports.find(i => i.name === 'http' || i.names?.includes('OptionsOfTextResponseBody'))
    expect(gotImport).toBeDefined()
    expect(gotImport?.value).toBe('got')
  })

  it('adds OptionsOfTextResponseBody import when http is got', () => {
    const configRead = config({
      input: 'test.json',
      meta: {
        import: {
          http: 'got',
        },
      },
    } as any)

    const gotImport = configRead.graphs.imports.find(i => i.name === 'http' && i.names?.includes('OptionsOfTextResponseBody'))
    expect(gotImport).toBeDefined()
    expect(gotImport?.value).toBe('got')
  })

  it('adds separate OptionsOfTextResponseBody import when http is not got', () => {
    const configRead = config({
      input: 'test.json',
      meta: {
        import: {
          http: 'custom-http',
        },
      },
    } as any)

    const customImport = configRead.graphs.imports.find(i => i.name === 'http')
    expect(customImport).toBeDefined()
    expect(customImport?.value).toBe('custom-http')

    const gotConfigImport = configRead.graphs.imports.find(i => i.names?.includes('OptionsOfTextResponseBody') && i.value === 'got')
    expect(gotConfigImport).toBeDefined()
  })
})
