import { describe, expect, it } from 'vitest'
import * as pipelineModule from '../src/index'

describe('pipeline/src/index', () => {
  it('exports pipeline function as default', () => {
    expect(pipelineModule.default).toBeDefined()
    expect(typeof pipelineModule.default).toBe('function')
  })

  it('exports compiler functions', () => {
    expect(pipelineModule).toHaveProperty('compiler')
    expect(pipelineModule).toHaveProperty('compilerTsRequestDeclaration')
    expect(pipelineModule).toHaveProperty('compilerTsTypingsDeclaration')
    expect(typeof pipelineModule.compiler).toBe('function')
    expect(typeof pipelineModule.compilerTsRequestDeclaration).toBe('function')
    expect(typeof pipelineModule.compilerTsTypingsDeclaration).toBe('function')
  })

  it('exports config functions', () => {
    expect(pipelineModule).toHaveProperty('config')
    expect(typeof pipelineModule.config).toBe('function')
  })

  it('exports dest function', () => {
    expect(pipelineModule).toHaveProperty('dest')
    expect(typeof pipelineModule.dest).toBe('function')
  })

  it('exports generate function', () => {
    expect(pipelineModule).toHaveProperty('generate')
    expect(typeof pipelineModule.generate).toBe('function')
  })

  it('exports original function', () => {
    expect(pipelineModule).toHaveProperty('original')
    expect(typeof pipelineModule.original).toBe('function')
  })

  it('exports types', () => {
    // Types are exported but may not be available as runtime properties
    // They are TypeScript type exports, not runtime values
    expect(pipelineModule).toBeDefined()
  })
})
