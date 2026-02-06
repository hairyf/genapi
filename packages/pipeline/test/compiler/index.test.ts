import type { ApiPipeline } from '@genapi/shared'
import { describe, expect, it } from 'vitest'
import { compiler } from '../../src/compiler'

describe('compiler', () => {
  it('compiles request code when output type is request and onlyDeclaration is false', () => {
    const configRead: ApiPipeline.ConfigRead = {
      config: {
        input: '',
        meta: {},
      } as ApiPipeline.Config,
      inputs: {},
      outputs: [
        {
          type: 'request',
          root: './dist',
          path: './dist/index.ts',
        },
      ],
      graphs: {
        comments: [],
        functions: [],
        imports: [],
        interfaces: [],
        typings: [],
        variables: [],
        response: {},
      },
    }

    const result = compiler(configRead)

    expect(result.outputs[0].code).toBeDefined()
    expect(typeof result.outputs[0].code).toBe('string')
  })

  it('does not compile request code when onlyDeclaration is true', () => {
    const configRead: ApiPipeline.ConfigRead = {
      config: {
        input: '',
        meta: {
          onlyDeclaration: true,
        },
      } as ApiPipeline.Config,
      inputs: {},
      outputs: [
        {
          type: 'request',
          root: './dist',
          path: './dist/index.ts',
        },
      ],
      graphs: {
        comments: [],
        functions: [],
        imports: [],
        interfaces: [],
        typings: [],
        variables: [],
        response: {},
      },
    }

    const result = compiler(configRead)

    expect(result.outputs[0].code).toBeUndefined()
  })

  it('compiles typings code when output type is typings', () => {
    const configRead: ApiPipeline.ConfigRead = {
      config: {
        input: '',
      } as ApiPipeline.Config,
      inputs: {},
      outputs: [
        {
          type: 'typings',
          root: './dist',
          path: './dist/types.d.ts',
        },
      ],
      graphs: {
        comments: [],
        functions: [],
        imports: [],
        interfaces: [],
        typings: [],
        variables: [],
        response: {},
      },
    }

    const result = compiler(configRead)

    expect(result.outputs[0].code).toBeDefined()
    expect(typeof result.outputs[0].code).toBe('string')
  })

  it('handles multiple outputs', () => {
    const configRead: ApiPipeline.ConfigRead = {
      config: {
        input: '',
        meta: {},
      } as ApiPipeline.Config,
      inputs: {},
      outputs: [
        {
          type: 'request',
          root: './dist',
          path: './dist/index.ts',
        },
        {
          type: 'typings',
          root: './dist',
          path: './dist/types.d.ts',
        },
      ],
      graphs: {
        comments: [],
        functions: [],
        imports: [],
        interfaces: [],
        typings: [],
        variables: [],
        response: {},
      },
    }

    const result = compiler(configRead)

    expect(result.outputs[0].code).toBeDefined()
    expect(result.outputs[1].code).toBeDefined()
  })

  it('returns the same configRead object', () => {
    const configRead: ApiPipeline.ConfigRead = {
      config: {
        input: '',
      } as ApiPipeline.Config,
      inputs: {},
      outputs: [
        {
          type: 'typings',
          root: './dist',
          path: './dist/types.d.ts',
        },
      ],
      graphs: {
        comments: [],
        functions: [],
        imports: [],
        interfaces: [],
        typings: [],
        variables: [],
        response: {},
      },
    }

    const result = compiler(configRead)

    expect(result).toBe(configRead)
  })

  it('handles empty outputs array', () => {
    const configRead: ApiPipeline.ConfigRead = {
      config: {
        input: '',
      } as ApiPipeline.Config,
      inputs: {},
      outputs: [],
      graphs: {
        comments: [],
        functions: [],
        imports: [],
        interfaces: [],
        typings: [],
        variables: [],
        response: {},
      },
    }

    const result = compiler(configRead)

    expect(result.outputs).toHaveLength(0)
  })
})
