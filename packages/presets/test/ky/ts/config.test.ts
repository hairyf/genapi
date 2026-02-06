import { describe, expect, it } from 'vitest'
import { config } from '../../../src/ky/ts/config'

describe('ky/ts config', () => {
  it('sets default http import to ky', () => {
    const configRead = config({
      input: 'test.json',
    } as any)

    const kyImport = configRead.graphs.imports.find(i => i.name === 'http' || i.names?.includes('Options'))
    expect(kyImport).toBeDefined()
    expect(kyImport?.value).toBe('ky')
  })

  it('adds Options import when http is ky', () => {
    const configRead = config({
      input: 'test.json',
      meta: {
        import: {
          http: 'ky',
        },
      },
    } as any)

    const kyImport = configRead.graphs.imports.find(i => i.name === 'http' && i.names?.includes('Options'))
    expect(kyImport).toBeDefined()
    expect(kyImport?.value).toBe('ky')
  })

  it('adds separate Options import when http is not ky', () => {
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

    const kyConfigImport = configRead.graphs.imports.find(i => i.names?.includes('Options') && i.value === 'ky')
    expect(kyConfigImport).toBeDefined()
  })
})
