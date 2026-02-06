import type { ApiPipeline } from '@genapi/shared'
import { describe, expect, it } from 'vitest'
import { config } from '../../src/config'

describe('config', () => {
  it('normalizes config with string input', () => {
    const userConfig: ApiPipeline.Config = {
      input: 'https://api.example.com/swagger.json',
      output: 'src/api/index.ts',
    }

    const result = config(userConfig)

    expect(result.inputs.uri).toBe('https://api.example.com/swagger.json')
    expect(result.outputs).toHaveLength(2) // request + typings
    expect(result.outputs[0].type).toBe('request')
    expect(result.outputs[0].path).toMatch(/[\\/]src[\\/]api[\\/]index\.ts$/)
  })

  it('normalizes config with object input', () => {
    const userConfig: ApiPipeline.Config = {
      input: {
        uri: 'https://api.example.com/swagger.json',
      },
      output: 'src/api/index.ts',
    }

    const result = config(userConfig)

    expect(result.inputs.uri).toBe('https://api.example.com/swagger.json')
  })

  it('sets default output path when not provided', () => {
    const userConfig: ApiPipeline.Config = {
      input: '',
    }

    const result = config(userConfig)

    expect(result.outputs[0].path).toMatch(/[\\/]src[\\/]api[\\/]index\.ts$/)
  })

  it('normalizes output from string to object', () => {
    const userConfig: ApiPipeline.Config = {
      input: '',
      output: 'src/api/index.ts',
    }

    const result = config(userConfig)

    expect(result.config.output).toHaveProperty('main', 'src/api/index.ts')
  })

  it('generates typings output path from main path', () => {
    const userConfig: ApiPipeline.Config = {
      input: '',
      output: {
        main: 'src/api/index.ts',
      },
    }

    const result = config(userConfig)

    expect(result.outputs).toHaveLength(2)
    expect(result.outputs[1].type).toBe('typings')
    expect(result.outputs[1].path).toContain('.type.ts')
  })

  it('disables typings output when type is false', () => {
    const userConfig: ApiPipeline.Config = {
      input: '',
      output: {
        main: 'src/api/index.ts',
        type: false,
      },
    }

    const result = config(userConfig)

    expect(result.outputs).toHaveLength(1)
    expect(result.outputs[0].type).toBe('request')
  })

  it('uses custom typings path when provided', () => {
    const userConfig: ApiPipeline.Config = {
      input: '',
      output: {
        main: 'src/api/index.ts',
        type: 'src/api/types.d.ts',
      },
    }

    const result = config(userConfig)

    expect(result.outputs).toHaveLength(2)
    expect(result.outputs[1].type).toBe('typings')
    expect(result.outputs[1].path).toContain('types.d.ts')
  })

  it('normalizes baseURL to remove trailing slash', () => {
    const userConfig: ApiPipeline.Config = {
      input: '',
      meta: {
        baseURL: 'https://api.example.com/"',
      },
    }

    const result = config(userConfig)

    expect(result.config.meta.baseURL).toBe('https://api.example.com"')
  })

  it('keeps baseURL unchanged when no trailing slash', () => {
    const userConfig: ApiPipeline.Config = {
      input: '',
      meta: {
        baseURL: 'https://api.example.com',
      },
    }

    const result = config(userConfig)

    expect(result.config.meta.baseURL).toBe('https://api.example.com')
  })

  it('normalizes responseType from string to object', () => {
    const userConfig: ApiPipeline.Config = {
      input: '',
      meta: {
        responseType: 'Infer',
      },
    }

    const result = config(userConfig)

    expect(result.config.meta.responseType).toEqual({ infer: 'Infer' })
    expect(result.graphs.response).toEqual({ infer: 'Infer' })
  })

  it('generates typings import when TypeScript and typings enabled', () => {
    const userConfig: ApiPipeline.Config = {
      input: '',
      output: {
        main: 'src/api/index.ts',
      },
    }

    const result = config(userConfig)

    expect(result.graphs.imports).toHaveLength(1)
    expect(result.graphs.imports[0].name).toBe('Types')
    expect(result.graphs.imports[0].type).toBe(true)
    expect(result.graphs.imports[0].namespace).toBe(true)
  })

  it('does not generate typings import for JavaScript', () => {
    const userConfig: ApiPipeline.Config = {
      input: '',
      output: {
        main: 'src/api/index.js',
      },
    }

    const result = config(userConfig)

    expect(result.graphs.imports).toHaveLength(0)
  })

  it('generates Infer type alias when responseType.infer is set', () => {
    const userConfig: ApiPipeline.Config = {
      input: '',
      meta: {
        responseType: {
          infer: 'Infer<T>',
        },
      },
    }

    const result = config(userConfig)

    expect(result.graphs.typings).toHaveLength(1)
    expect(result.graphs.typings[0].name).toBe('Infer<T>')
    expect(result.graphs.typings[0].export).toBe(true)
  })

  it('initializes meta object when not provided', () => {
    const userConfig: ApiPipeline.Config = {
      input: '',
    }

    const result = config(userConfig)

    expect(result.config.meta).toBeDefined()
    expect(result.config.meta.import).toBeDefined()
    expect(result.config.meta.responseType).toBeDefined()
  })

  it('calculates import type path correctly', () => {
    const userConfig: ApiPipeline.Config = {
      input: '',
      output: {
        main: 'src/api/index.ts',
        type: 'src/types/api.d.ts',
      },
    }

    const result = config(userConfig)

    expect(result.graphs.imports[0].value).toBeTruthy()
    expect(result.outputs[1].import).toBeTruthy()
  })

  it('handles custom import type path', () => {
    const userConfig: ApiPipeline.Config = {
      input: '',
      output: {
        main: 'src/api/index.ts',
      },
      meta: {
        import: {
          type: './custom-types',
        },
      },
    }

    const result = config(userConfig)

    expect(result.graphs.imports[0].value).toBe('./custom-types')
  })

  it('provides config and configRead to context', () => {
    const userConfig: ApiPipeline.Config = {
      input: '',
    }

    const result = config(userConfig)

    expect(result).toBeDefined()
    expect(result.config).toBeDefined()
    expect(result.inputs).toBeDefined()
    expect(result.outputs).toBeDefined()
    expect(result.graphs).toBeDefined()
  })

  it('handles input with json property', () => {
    const userConfig: ApiPipeline.Config = {
      input: {
        json: './swagger.json',
      },
    }

    const result = config(userConfig)

    expect(result.inputs.json).toBe('./swagger.json')
  })

  it('handles input with http property', () => {
    const userConfig: ApiPipeline.Config = {
      input: {
        http: {
          url: 'https://api.example.com/swagger.json',
          headers: {
            Authorization: 'Bearer token',
          },
        } as any,
      },
    }

    const result = config(userConfig)

    expect(result.inputs.http).toBeDefined()
    expect((result.inputs.http as any)?.url).toBe('https://api.example.com/swagger.json')
  })

  it('handles output with type as empty string', () => {
    const userConfig: ApiPipeline.Config = {
      input: '',
      output: {
        main: 'src/api/index.ts',
        type: '',
      },
    }

    const result = config(userConfig)

    expect(result.outputs).toHaveLength(2)
    expect(result.outputs[1].type).toBe('typings')
  })

  it('handles baseURL ending with /"', () => {
    const userConfig: ApiPipeline.Config = {
      input: '',
      meta: {
        baseURL: 'https://api.example.com/"',
      },
    }

    const result = config(userConfig)

    expect(result.config.meta.baseURL).toBe('https://api.example.com"')
  })

  it('handles responseType as empty string', () => {
    const userConfig: ApiPipeline.Config = {
      input: '',
      meta: {
        responseType: '',
      },
    }

    const result = config(userConfig)

    // Empty string is falsy, so it won't be converted to object
    expect(result.config.meta.responseType).toBeDefined()
  })

  it('calculates import type path with relative path', () => {
    const userConfig: ApiPipeline.Config = {
      input: '',
      output: {
        main: 'src/api/index.ts',
        type: 'src/types/api.d.ts',
      },
    }

    const result = config(userConfig)

    expect(result.graphs.imports[0].value).toBeTruthy()
    expect(result.outputs[1].import).toBeTruthy()
  })
})
