import { describe, expect, it } from 'vitest'
import * as transformModule from '../../src/transform'

describe('parser/src/transform/index', () => {
  it('exports all transform functions', () => {
    expect(transformModule).toBeDefined()
    expect(transformModule).toHaveProperty('transformBodyStringify')
    expect(transformModule).toHaveProperty('transformDefinitions')
    expect(transformModule).toHaveProperty('transformHeaderOptions')
    expect(transformModule).toHaveProperty('transformOperation')
    expect(transformModule).toHaveProperty('transformParameters')
    expect(transformModule).toHaveProperty('transformBaseURL')
  })

  it('exports functions are callable', () => {
    expect(typeof transformModule.transformBodyStringify).toBe('function')
    expect(typeof transformModule.transformDefinitions).toBe('function')
    expect(typeof transformModule.transformHeaderOptions).toBe('function')
    expect(typeof transformModule.transformOperation).toBe('function')
    expect(typeof transformModule.transformParameters).toBe('function')
    expect(typeof transformModule.transformBaseURL).toBe('function')
  })
})
