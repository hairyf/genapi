import { describe, expect, it } from 'vitest'
import { config } from '../../../src/ky/js/config'

describe('ky/js config', () => {
  it('sets default http import to ky', () => {
    const configRead = config({
      input: 'test.json',
    } as any)

    const kyImport = configRead.graphs.imports.find(i => i.name === 'http')
    expect(kyImport).toBeDefined()
    expect(kyImport?.value).toBe('ky')
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
          http: 'custom-ky',
        },
      },
    } as any)

    const customImport = configRead.graphs.imports.find(i => i.name === 'http')
    expect(customImport).toBeDefined()
    expect(customImport?.value).toBe('custom-ky')
  })
})
