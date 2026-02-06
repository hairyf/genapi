import { describe, expect, it } from 'vitest'
import { config } from '../../../src/uni/ts/config'

describe('uni/ts config', () => {
  it('sets default http import to @uni-helper/uni-network', () => {
    const configRead = config({
      input: 'test.json',
    } as any)

    const uniImport = configRead.graphs.imports.find(i => i.name === 'http' || i.names?.includes('UnConfig'))
    expect(uniImport).toBeDefined()
    expect(uniImport?.value).toBe('@uni-helper/uni-network')
  })

  it('adds UnConfig import when http is @uni-helper/uni-network', () => {
    const configRead = config({
      input: 'test.json',
      meta: {
        import: {
          http: '@uni-helper/uni-network',
        },
      },
    } as any)

    const uniImport = configRead.graphs.imports.find(i => i.name === 'http' && i.names?.includes('UnConfig'))
    expect(uniImport).toBeDefined()
    expect(uniImport?.value).toBe('@uni-helper/uni-network')
  })

  it('adds separate UnConfig import when http is not @uni-helper/uni-network', () => {
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

    const uniConfigImport = configRead.graphs.imports.find(i => i.names?.includes('UnConfig') && i.value === '@uni-helper/uni-network')
    expect(uniConfigImport).toBeDefined()
  })
})
