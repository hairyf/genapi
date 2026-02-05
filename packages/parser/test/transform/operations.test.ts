import type { ApiPipeline, StatementField } from '@genapi/shared'
import { provide } from '@genapi/shared'
import { beforeEach, describe, expect, it } from 'vitest'
import { transformOperation } from '../../src/transform/operations'

describe('transformOperation', () => {
  let configRead: ApiPipeline.ConfigRead
  let parameters: StatementField[]

  beforeEach(() => {
    parameters = [
      { name: 'id', type: 'string', required: true },
      { name: 'name', type: 'string', required: false },
    ]
    configRead = {
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
    provide({ configRead })
  })

  it('returns original values when no patch or transform configured', () => {
    const result = transformOperation({
      configRead,
      name: 'getUser',
      parameters,
      responseType: 'User',
    })

    expect(result.name).toBe('getUser')
    expect(result.responseType).toBe('User')
    expect(result.parameters).toBe(parameters)
    expect(result.parameters).toHaveLength(2)
  })

  it('applies string patch to rename operation', () => {
    configRead.config.patch = {
      operations: {
        getUser: 'fetchUser',
      },
    }

    const result = transformOperation({
      configRead,
      name: 'getUser',
      parameters,
      responseType: 'User',
    })

    expect(result.name).toBe('fetchUser')
    expect(result.responseType).toBe('User')
    expect(result.parameters).toBe(parameters)
  })

  it('applies object patch to rename and override parameters', () => {
    const newParameters: StatementField[] = [
      { name: 'userId', type: 'number', required: true },
    ]
    configRead.config.patch = {
      operations: {
        getUser: {
          name: 'fetchUser',
          parameters: newParameters,
        },
      },
    }

    const result = transformOperation({
      configRead,
      name: 'getUser',
      parameters,
      responseType: 'User',
    })

    expect(result.name).toBe('fetchUser')
    expect(result.parameters).toBe(parameters) // Same array reference
    expect(result.parameters).toHaveLength(1)
    expect(result.parameters[0]).toEqual(newParameters[0])
  })

  it('applies patch to override responseType', () => {
    configRead.config.patch = {
      operations: {
        getUser: {
          responseType: 'UserResponse',
        },
      },
    }

    const result = transformOperation({
      configRead,
      name: 'getUser',
      parameters,
      responseType: 'User',
    })

    expect(result.name).toBe('getUser')
    expect(result.responseType).toBe('UserResponse')
  })

  it('applies transform.operation before static patch', () => {
    configRead.config.transform = {
      operation: (name) => {
        // Transform: add prefix
        return `api_${name}`
      },
      definition: () => '',
    }
    configRead.config.patch = {
      operations: {
        api_getUser: 'fetchUser', // Patch targets transformed name
      },
    }

    const result = transformOperation({
      configRead,
      name: 'getUser',
      parameters,
      responseType: 'User',
    })

    expect(result.name).toBe('fetchUser')
  })

  it('applies transform.operation that returns object', () => {
    configRead.config.transform = {
      operation: (name, params) => {
        return {
          name: `transformed_${name}`,
          parameters: params.slice(0, 1), // Keep only first param
        }
      },
      definition: () => '',
    }

    const result = transformOperation({
      configRead,
      name: 'getUser',
      parameters,
      responseType: 'User',
    })

    expect(result.name).toBe('transformed_getUser')
    expect(result.parameters).toHaveLength(1)
    expect(result.parameters[0].name).toBe('id')
  })

  it('mutates parameters array in place when patch overrides', () => {
    const newParams: StatementField[] = [
      { name: 'x', type: 'string', required: true },
    ]

    configRead.config.patch = {
      operations: {
        getUser: {
          parameters: newParams,
        },
      },
    }

    const paramRef = parameters
    const result = transformOperation({
      configRead,
      name: 'getUser',
      parameters,
      responseType: 'User',
    })

    expect(result.parameters).toBe(paramRef)
    expect(result.parameters).toBe(parameters)
    expect(parameters.length).toBe(1)
    expect(parameters[0]).toEqual(newParams[0])
  })

  it('handles patch for non-existent operation name', () => {
    configRead.config.patch = {
      operations: {
        nonExistent: 'renamed',
      },
    }

    const result = transformOperation({
      configRead,
      name: 'getUser',
      parameters,
      responseType: 'User',
    })

    expect(result.name).toBe('getUser') // No change
  })

  it('applies transform then patch in sequence', () => {
    configRead.config.transform = {
      operation: name => `transformed_${name}`,
      definition: () => '',
    }
    configRead.config.patch = {
      operations: {
        transformed_getUser: {
          name: 'final_getUser',
          responseType: 'FinalUser',
        },
      },
    }

    const result = transformOperation({
      configRead,
      name: 'getUser',
      parameters,
      responseType: 'User',
    })

    expect(result.name).toBe('final_getUser')
    expect(result.responseType).toBe('FinalUser')
  })
})
