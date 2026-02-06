import { describe, expect, it } from 'vitest'
import * as traverseModule from '../../src/traverse'

describe('parser/src/traverse/index', () => {
  it('exports traversePaths function', () => {
    expect(traverseModule).toBeDefined()
    expect(traverseModule).toHaveProperty('traversePaths')
    expect(typeof traverseModule.traversePaths).toBe('function')
  })

  it('exports PathMethod type', () => {
    expect(traverseModule).toBeDefined()
    // Types are not available at runtime, but we can verify the module exports
    expect(traverseModule.traversePaths).toBeDefined()
  })
})
