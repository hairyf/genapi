import { describe, expect, it } from 'vitest'
import { config } from '../../../src/fetch/ts/config'

describe('fetch/ts config', () => {
  it('sets default http import', () => {
    const configRead = config({
      input: 'test.json',
    } as any)

    expect(configRead.config.meta).toBeDefined()
    expect(configRead.config.meta?.import).toBeDefined()
  })

  it('handles missing meta object', () => {
    const configRead = config({
      input: 'test.json',
    } as any)

    expect(configRead.config.meta).toBeDefined()
    expect(configRead.config.meta?.import).toBeDefined()
  })
})
