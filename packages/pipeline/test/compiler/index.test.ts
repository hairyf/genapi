import type { ApiPipeline } from '@genapi/shared'
import { describe, expect, it } from 'vitest'
import { compiler } from '../../src/compiler'

describe('compiler', () => {
  const emptyScopes = {
    main: { comments: [], functions: [], imports: [], variables: [], typings: [], interfaces: [] },
    type: { comments: [], functions: [], imports: [], variables: [], typings: [], interfaces: [] },
  }

  it('compiles main scope when output type is main and onlyDeclaration is false', () => {
    const configRead: ApiPipeline.ConfigRead = {
      config: { input: '', meta: {} } as ApiPipeline.Config,
      inputs: {},
      outputs: [{ type: 'main', root: './dist', path: './dist/index.ts' }],
      graphs: { scopes: { ...emptyScopes }, response: {} },
    }
    const result = compiler(configRead)
    expect(result.outputs[0].code).toBeDefined()
    expect(typeof result.outputs[0].code).toBe('string')
  })

  it('does not compile main when onlyDeclaration is true', () => {
    const configRead: ApiPipeline.ConfigRead = {
      config: { input: '', meta: { onlyDeclaration: true } } as ApiPipeline.Config,
      inputs: {},
      outputs: [
        { type: 'main', root: './dist', path: './dist/index.ts' },
        { type: 'type', root: './dist', path: './dist/types.d.ts' },
      ],
      graphs: { scopes: { ...emptyScopes }, response: {} },
    }
    const result = compiler(configRead)
    expect(result.outputs[0].code).toBeUndefined()
    expect(result.outputs[1].code).toBeDefined()
  })

  it('compiles type scope when output type is type', () => {
    const configRead: ApiPipeline.ConfigRead = {
      config: { input: '' } as ApiPipeline.Config,
      inputs: {},
      outputs: [{ type: 'type', root: './dist', path: './dist/types.d.ts' }],
      graphs: { scopes: { ...emptyScopes }, response: {} },
    }
    const result = compiler(configRead)
    expect(result.outputs[0].code).toBeDefined()
    expect(typeof result.outputs[0].code).toBe('string')
  })

  it('handles multiple outputs', () => {
    const configRead: ApiPipeline.ConfigRead = {
      config: { input: '', meta: {} } as ApiPipeline.Config,
      inputs: {},
      outputs: [
        { type: 'main', root: './dist', path: './dist/index.ts' },
        { type: 'type', root: './dist', path: './dist/types.d.ts' },
      ],
      graphs: { scopes: { ...emptyScopes }, response: {} },
    }
    const result = compiler(configRead)
    expect(result.outputs[0].code).toBeDefined()
    expect(result.outputs[1].code).toBeDefined()
  })

  it('returns the same configRead object', () => {
    const configRead: ApiPipeline.ConfigRead = {
      config: { input: '' } as ApiPipeline.Config,
      inputs: {},
      outputs: [{ type: 'type', root: './dist', path: './dist/types.d.ts' }],
      graphs: { scopes: { ...emptyScopes }, response: {} },
    }
    const result = compiler(configRead)
    expect(result).toBe(configRead)
  })

  it('handles empty outputs array', () => {
    const configRead: ApiPipeline.ConfigRead = {
      config: { input: '' } as ApiPipeline.Config,
      inputs: {},
      outputs: [],
      graphs: { scopes: {}, response: {} },
    }
    const result = compiler(configRead)
    expect(result.outputs).toHaveLength(0)
  })
})
