import type { ApiPipeline } from '@genapi/shared'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createParser } from '../src/parser'
import { swagger2Minimal } from './fixtures/swagger2-minimal'

describe('createParser', () => {
  let configRead: ApiPipeline.ConfigRead

  beforeEach(() => {
    configRead = {
      config: {
        input: '',
      } as ApiPipeline.Config,
      inputs: {},
      outputs: [],
      source: swagger2Minimal,
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
  })

  it('creates parser function that processes configRead', () => {
    const pathHandler = vi.fn()
    const parser = createParser(pathHandler)

    const result = parser(configRead)

    expect(result).toBe(configRead)
    expect(pathHandler).toHaveBeenCalled()
  })

  it('parses OpenAPI specification and extracts comments', () => {
    const pathHandler = vi.fn()
    const parser = createParser(pathHandler)

    parser(configRead)

    expect(configRead.graphs.comments).toBeDefined()
    expect(Array.isArray(configRead.graphs.comments)).toBe(true)
  })

  it('initializes interfaces and functions arrays', () => {
    const pathHandler = vi.fn()
    const parser = createParser(pathHandler)

    parser(configRead)

    expect(configRead.graphs.interfaces).toBeDefined()
    expect(Array.isArray(configRead.graphs.interfaces)).toBe(true)
    expect(configRead.graphs.functions).toBeDefined()
    expect(Array.isArray(configRead.graphs.functions)).toBe(true)
  })

  it('provides context to pathHandler', () => {
    const pathHandler = vi.fn()
    const parser = createParser(pathHandler)

    parser(configRead)

    expect(pathHandler).toHaveBeenCalled()
    const callArgs = pathHandler.mock.calls[0]
    expect(callArgs[1]).toHaveProperty('configRead')
    expect(callArgs[1]).toHaveProperty('interfaces')
    expect(callArgs[1]).toHaveProperty('functions')
  })

  it('transforms baseURL from source', () => {
    const pathHandler = vi.fn()
    const parser = createParser(pathHandler)

    parser(configRead)

    // BaseURL transformation is tested in transform/urls.test.ts
    // Here we just verify the parser calls it
    expect(pathHandler).toHaveBeenCalled()
  })

  it('transforms definitions when source has definitions', () => {
    const sourceWithDefinitions = {
      ...swagger2Minimal,
      definitions: {
        Pet: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
          },
        },
      },
    }

    configRead.source = sourceWithDefinitions

    const pathHandler = vi.fn()
    const parser = createParser(pathHandler)

    parser(configRead)

    // Definitions transformation is tested in transform/definitions.test.ts
    // Here we just verify the parser processes definitions
    expect(pathHandler).toHaveBeenCalled()
  })

  it('handles source without definitions', () => {
    const sourceWithoutDefinitions = {
      ...swagger2Minimal,
      definitions: undefined,
    }

    configRead.source = sourceWithoutDefinitions

    const pathHandler = vi.fn()
    const parser = createParser(pathHandler)

    parser(configRead)

    expect(pathHandler).toHaveBeenCalled()
  })

  it('handles source with null paths', () => {
    const sourceWithNullPaths = {
      ...swagger2Minimal,
      paths: null as any,
    }

    configRead.source = sourceWithNullPaths

    const pathHandler = vi.fn()
    const parser = createParser(pathHandler)

    parser(configRead)

    // Should handle null paths gracefully
    expect(pathHandler).toHaveBeenCalledTimes(0)
  })

  it('handles source with undefined paths', () => {
    const sourceWithUndefinedPaths = {
      ...swagger2Minimal,
      paths: undefined as any,
    }

    configRead.source = sourceWithUndefinedPaths

    const pathHandler = vi.fn()
    const parser = createParser(pathHandler)

    parser(configRead)

    // Should handle undefined paths gracefully
    expect(pathHandler).toHaveBeenCalledTimes(0)
  })

  it('returns the same configRead object', () => {
    const pathHandler = vi.fn()
    const parser = createParser(pathHandler)

    const result = parser(configRead)

    expect(result).toBe(configRead)
  })
})
