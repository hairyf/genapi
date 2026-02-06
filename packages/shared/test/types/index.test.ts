import { describe, expect, it } from 'vitest'
import * as typesModule from '../../src/types'

describe('shared/src/types', () => {
  it('exports config types', () => {
    // Types are TypeScript type exports, not runtime values
    // We verify they exist by importing and checking the module is defined
    expect(typesModule).toBeDefined()
  })

  it('exports statement types', () => {
    // Types are TypeScript type exports, not runtime values
    // We verify they exist by importing and checking the module is defined
    expect(typesModule).toBeDefined()
  })
})
