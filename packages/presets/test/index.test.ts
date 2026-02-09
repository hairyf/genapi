import { describe, expect, it } from 'vitest'
import * as presetsModule from '../src/index'

describe('presets/src/index', () => {
  it('exports axios preset', () => {
    expect(presetsModule).toHaveProperty('axios')
    expect(presetsModule.axios).toBeDefined()
  })

  it('exports fetch preset', () => {
    expect(presetsModule).toHaveProperty('fetch')
    expect(presetsModule.fetch).toBeDefined()
  })

  it('exports got preset', () => {
    expect(presetsModule).toHaveProperty('got')
    expect(presetsModule.got).toBeDefined()
  })

  it('exports ky preset', () => {
    expect(presetsModule).toHaveProperty('ky')
    expect(presetsModule.ky).toBeDefined()
  })

  it('exports ofetch preset', () => {
    expect(presetsModule).toHaveProperty('ofetch')
    expect(presetsModule.ofetch).toBeDefined()
  })

  it('exports tanstack preset', () => {
    expect(presetsModule).toHaveProperty('tanstackQuery')
    expect(presetsModule.tanstackQuery).toBeDefined()
    expect(presetsModule.tanstackQuery).toHaveProperty('react')
    expect(presetsModule.tanstackQuery).toHaveProperty('vue')
    expect(presetsModule.tanstackQuery).toHaveProperty('colada')
    expect(presetsModule.tanstackQuery.react).toBeDefined()
    expect(presetsModule.tanstackQuery.vue).toBeDefined()
    expect(presetsModule.tanstackQuery.colada).toBeDefined()
  })

  it('exports uni preset', () => {
    expect(presetsModule).toHaveProperty('uni')
    expect(presetsModule.uni).toBeDefined()
  })

  it('exports default object with all presets', () => {
    expect(presetsModule.default).toBeDefined()
    expect(presetsModule.default).toHaveProperty('axios')
    expect(presetsModule.default).toHaveProperty('fetch')
    expect(presetsModule.default).toHaveProperty('got')
    expect(presetsModule.default).toHaveProperty('ky')
    expect(presetsModule.default).toHaveProperty('ofetch')
    expect(presetsModule.default).toHaveProperty('tanstackQuery')
    expect(presetsModule.default).toHaveProperty('uni')
  })
})
