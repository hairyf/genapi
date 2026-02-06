import { describe, expect, it } from 'vitest'
import * as transformModule from '../src/index'

describe('transform/src/index', () => {
  it('exports transform functions', () => {
    expect(transformModule).toBeDefined()
    expect(transformModule).toHaveProperty('swagger2ToSwagger3')
    expect(transformModule).toHaveProperty('wpapiToSwagger2')
    expect(transformModule).toHaveProperty('default')
  })

  it('exports functions are callable', () => {
    expect(typeof transformModule.swagger2ToSwagger3).toBe('function')
    expect(typeof transformModule.wpapiToSwagger2).toBe('function')
  })

  it('exports default object with transform functions', () => {
    expect(transformModule.default).toBeDefined()
    expect(transformModule.default).toHaveProperty('swagger2ToSwagger3')
    expect(transformModule.default).toHaveProperty('wpapiToSwagger2')
    expect(typeof transformModule.default.swagger2ToSwagger3).toBe('function')
    expect(typeof transformModule.default.wpapiToSwagger2).toBe('function')
  })
})
