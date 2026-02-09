import type { ApiPipeline } from '@genapi/shared'
import { describe, expect, it } from 'vitest'
import { pipeline } from '../../src/pipeline'

describe('pipeline', () => {
  it('creates pipeline function from steps', async () => {
    const configStep = (config: ApiPipeline.Config) => {
      return {
        config,
        inputs: {},
        outputs: [],
        graphs: {
          scopes: { main: { comments: [], functions: [], imports: [], variables: [], typings: [], interfaces: [] } },
          response: {},
        },
      } as ApiPipeline.ConfigRead
    }

    const originalStep = (configRead: ApiPipeline.ConfigRead) => configRead
    const parserStep = (configRead: ApiPipeline.ConfigRead) => configRead
    const compilerStep = (configRead: ApiPipeline.ConfigRead) => configRead
    const generateStep = (configRead: ApiPipeline.ConfigRead) => configRead
    const destStep = (_configRead: ApiPipeline.ConfigRead) => {
      // Do nothing
    }

    const pipe = pipeline(
      configStep,
      originalStep,
      parserStep,
      compilerStep,
      generateStep,
      destStep,
    )

    expect(typeof pipe).toBe('function')

    // Test that the pipeline function can be called
    const testConfig: ApiPipeline.Config = {
      input: '',
    }
    await pipe(testConfig)
  })

  it('creates pipeline function that executes steps in order', async () => {
    const executionOrder: string[] = []

    const configStep = (config: ApiPipeline.Config) => {
      executionOrder.push('config')
      return {
        config,
        inputs: {},
        outputs: [],
        graphs: {
          scopes: { main: { comments: [], functions: [], imports: [], variables: [], typings: [], interfaces: [] } },
          response: {},
        },
      } as ApiPipeline.ConfigRead
    }

    const originalStep = (configRead: ApiPipeline.ConfigRead) => {
      executionOrder.push('original')
      return configRead
    }
    const parserStep = (configRead: ApiPipeline.ConfigRead) => {
      executionOrder.push('parser')
      return configRead
    }
    const compilerStep = (configRead: ApiPipeline.ConfigRead) => {
      executionOrder.push('compiler')
      return configRead
    }
    const generateStep = (configRead: ApiPipeline.ConfigRead) => {
      executionOrder.push('generate')
      return configRead
    }
    const destStep = (_configRead: ApiPipeline.ConfigRead) => {
      executionOrder.push('dest')
    }

    const pipe = pipeline(
      configStep,
      originalStep,
      parserStep,
      compilerStep,
      generateStep,
      destStep,
    )

    const testConfig: ApiPipeline.Config = {
      input: '',
    }
    await pipe(testConfig)

    expect(executionOrder).toEqual(['config', 'original', 'parser', 'compiler', 'generate', 'dest'])
  })

  it('handles async steps', async () => {
    const configStep = async (config: ApiPipeline.Config) => {
      return {
        config,
        inputs: {},
        outputs: [],
        graphs: {
          scopes: { main: { comments: [], functions: [], imports: [], variables: [], typings: [], interfaces: [] } },
          response: {},
        },
      } as ApiPipeline.ConfigRead
    }

    const originalStep = async (configRead: ApiPipeline.ConfigRead) => configRead
    const parserStep = (configRead: ApiPipeline.ConfigRead) => configRead
    const compilerStep = (configRead: ApiPipeline.ConfigRead) => configRead
    const generateStep = (configRead: ApiPipeline.ConfigRead) => configRead
    const destStep = (_configRead: ApiPipeline.ConfigRead) => {
      // Do nothing - dest step doesn't return a value
    }

    const pipe = pipeline(
      configStep,
      originalStep,
      parserStep,
      compilerStep,
      generateStep,
      destStep,
    )

    const testConfig: ApiPipeline.Config = {
      input: '',
    }
    // Pipeline returns undefined because dest step doesn't return a value
    const result = await pipe(testConfig)
    expect(result).toBeUndefined()
  })

  it('exposes config function', () => {
    expect(pipeline.config).toBeDefined()
    expect(typeof pipeline.config).toBe('function')
  })

  it('exposes original function', () => {
    expect(pipeline.original).toBeDefined()
    expect(typeof pipeline.original).toBe('function')
  })

  it('exposes compiler function', () => {
    expect(pipeline.compiler).toBeDefined()
    expect(typeof pipeline.compiler).toBe('function')
  })

  it('exposes generate function', () => {
    expect(pipeline.generate).toBeDefined()
    expect(typeof pipeline.generate).toBe('function')
  })

  it('exposes dest function', () => {
    expect(pipeline.dest).toBeDefined()
    expect(typeof pipeline.dest).toBe('function')
  })
})
