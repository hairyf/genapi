import { describe, expect, it } from 'vitest'
import { config } from '../../../src/axios/ts/config'

describe('axios/ts config', () => {
  it('sets default http import to axios', () => {
    const configRead = config({
      input: 'test.json',
    } as any)

    const axiosImport = configRead.graphs.scopes.main.imports.find(i => i.name === 'http' || i.names?.includes('AxiosRequestConfig'))
    expect(axiosImport).toBeDefined()
    expect(axiosImport?.value).toBe('axios')
  })

  it('adds AxiosRequestConfig import when http is axios', () => {
    const configRead = config({
      input: 'test.json',
      meta: {
        import: {
          http: 'axios',
        },
      },
    } as any)

    const axiosImport = configRead.graphs.scopes.main.imports.find(i => i.name === 'http' && i.names?.includes('AxiosRequestConfig'))
    expect(axiosImport).toBeDefined()
    expect(axiosImport?.value).toBe('axios')
  })

  it('adds separate AxiosRequestConfig import when http is not axios', () => {
    const configRead = config({
      input: 'test.json',
      meta: {
        import: {
          http: 'custom-http',
        },
      },
    } as any)

    const customImport = configRead.graphs.scopes.main.imports.find(i => i.name === 'http')
    expect(customImport).toBeDefined()
    expect(customImport?.value).toBe('custom-http')

    const axiosConfigImport = configRead.graphs.scopes.main.imports.find(i => i.names?.includes('AxiosRequestConfig') && i.value === 'axios')
    expect(axiosConfigImport).toBeDefined()
  })

  it('handles missing meta object', () => {
    const configRead = config({
      input: 'test.json',
    } as any)

    expect(configRead.config.meta).toBeDefined()
    expect(configRead.config.meta?.import).toBeDefined()
    expect(configRead.config.meta?.import?.http).toBe('axios')
  })

  it('handles missing import object', () => {
    const configRead = config({
      input: 'test.json',
      meta: {},
    } as any)

    expect(configRead.config.meta?.import).toBeDefined()
    expect(configRead.config.meta?.import?.http).toBe('axios')
  })
})
