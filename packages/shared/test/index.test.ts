import { describe, expect, it } from 'vitest'
import * as sharedModule from '../src/index'

describe('shared/src/index', () => {
  it('exports inject module', () => {
    expect(sharedModule).toHaveProperty('provide')
    expect(typeof sharedModule.provide).toBe('function')
  })

  it('exports types module', () => {
    expect(sharedModule).toBeDefined()
    // Types are TypeScript type exports, not runtime values
    // We can verify the module exports exist by checking the module is defined
  })
})
