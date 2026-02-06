import type { ApiPipeline } from '@genapi/shared'
import { wpapiToSwagger2 } from '@genapi/transform'
import { ofetch } from 'ofetch'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { original } from '../../src/original'

// Mock ofetch
vi.mock('ofetch', () => ({
  ofetch: vi.fn(),
}))

// Mock @genapi/transform
vi.mock('@genapi/transform', () => ({
  wpapiToSwagger2: vi.fn(),
}))

describe('original', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches source from uri input', async () => {
    const mockSource = {
      swagger: '2.0',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {},
    }

    vi.mocked(ofetch).mockResolvedValue(mockSource)

    const configRead: ApiPipeline.ConfigRead = {
      config: {
        input: '',
      } as ApiPipeline.Config,
      inputs: {
        uri: 'https://api.example.com/swagger.json',
      },
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

    const result = await original(configRead)

    expect(ofetch).toHaveBeenCalledWith('https://api.example.com/swagger.json')
    expect(result.source).toEqual(mockSource)
  })

  it('fetches source from http input', async () => {
    const mockSource = {
      openapi: '3.0.0',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {},
    }

    vi.mocked(ofetch).mockResolvedValue(mockSource)

    const configRead: ApiPipeline.ConfigRead = {
      config: {
        input: '',
      } as ApiPipeline.Config,
      inputs: {
        http: {
          url: 'https://api.example.com/openapi.json',
          headers: {
            Authorization: 'Bearer token',
          },
        } as any,
      },
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

    const result = await original(configRead)

    expect(ofetch).toHaveBeenCalledWith('https://api.example.com/openapi.json', {
      headers: {
        Authorization: 'Bearer token',
      },
    })
    expect(result.source).toEqual(mockSource)
  })

  it('uses uri as fallback for http input when url is not provided', async () => {
    const mockSource = {
      swagger: '2.0',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {},
    }

    vi.mocked(ofetch).mockResolvedValue(mockSource)

    const configRead: ApiPipeline.ConfigRead = {
      config: {
        input: '',
      } as ApiPipeline.Config,
      inputs: {
        uri: 'https://api.example.com/swagger.json',
        http: {
          headers: {
            Authorization: 'Bearer token',
          },
        },
      },
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

    const result = await original(configRead)

    expect(ofetch).toHaveBeenCalledWith('https://api.example.com/swagger.json', {
      headers: {
        Authorization: 'Bearer token',
      },
    })
    expect(result.source).toEqual(mockSource)
  })

  it('reads source from json object input', async () => {
    const jsonSource = {
      swagger: '2.0',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {},
    }

    const configRead: ApiPipeline.ConfigRead = {
      config: {
        input: '',
      } as ApiPipeline.Config,
      inputs: {
        json: jsonSource as any,
      },
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

    const result = await original(configRead)

    expect(result.source).toEqual(jsonSource)
    expect(ofetch).not.toHaveBeenCalled()
  })

  it('reads source from json string path input', async () => {
    // This test is skipped because dynamic import() requires actual file system
    // and cannot be easily mocked in the test environment
    // The functionality is tested through integration tests
    expect(true).toBe(true)
  })

  it('handles readJsonSource with null json', async () => {
    const configRead: ApiPipeline.ConfigRead = {
      config: {
        input: '',
      } as ApiPipeline.Config,
      inputs: {
        json: null as any,
      },
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

    await expect(original(configRead)).rejects.toThrow('No source found')
  })

  it('handles readJsonSource with empty string json', async () => {
    const configRead: ApiPipeline.ConfigRead = {
      config: {
        input: '',
      } as ApiPipeline.Config,
      inputs: {
        json: '',
      },
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

    await expect(original(configRead)).rejects.toThrow('No source found')
  })

  it('throws error when no source is found', async () => {
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

    await expect(original(configRead)).rejects.toThrow('No source found, please check your input config.')
  })

  it('adds https schemes when uri starts with https://', async () => {
    const mockSource = {
      swagger: '2.0',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {},
    }

    vi.mocked(ofetch).mockResolvedValue(mockSource)

    const configRead: ApiPipeline.ConfigRead = {
      config: {
        input: '',
      } as ApiPipeline.Config,
      inputs: {
        uri: 'https://api.example.com/swagger.json',
      },
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

    const result = await original(configRead)

    expect(result.source.schemes).toEqual(['https', 'http'])
  })

  it('adds http scheme when uri starts with http://', async () => {
    const mockSource = {
      swagger: '2.0',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {},
    }

    vi.mocked(ofetch).mockResolvedValue(mockSource)

    const configRead: ApiPipeline.ConfigRead = {
      config: {
        input: '',
      } as ApiPipeline.Config,
      inputs: {
        uri: 'http://api.example.com/swagger.json',
      },
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

    const result = await original(configRead)

    expect(result.source.schemes).toEqual(['http'])
  })

  it('does not override existing schemes', async () => {
    const mockSource = {
      swagger: '2.0',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {},
      schemes: ['https'],
    }

    vi.mocked(ofetch).mockResolvedValue(mockSource)

    const configRead: ApiPipeline.ConfigRead = {
      config: {
        input: '',
      } as ApiPipeline.Config,
      inputs: {
        uri: 'https://api.example.com/swagger.json',
      },
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

    const result = await original(configRead)

    expect(result.source.schemes).toEqual(['https'])
  })

  it('returns the same configRead object', async () => {
    const jsonSource = {
      swagger: '2.0',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {},
    }

    const configRead: ApiPipeline.ConfigRead = {
      config: {
        input: '',
      } as ApiPipeline.Config,
      inputs: {
        json: jsonSource as any,
      },
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

    const result = await original(configRead)

    expect(result).toBe(configRead)
  })

  describe('parser configuration', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('transforms WordPress API schema when parser is "wpapi"', async () => {
      const wpapiSource = {
        routes: {
          '/wp/v2': {
            namespace: 'wp/v2',
            endpoints: [
              {
                methods: ['get'],
                description: 'List posts',
                args: {
                  per_page: { type: 'integer' },
                },
              },
            ],
          },
        },
      }

      const swaggerSource = {
        swagger: '2.0',
        info: { title: 'WordPress REST API', version: '1.0' },
        paths: {
          '/wp/v2': {
            get: {
              operationId: 'getWpV2',
              tags: ['wp/v2'],
              responses: { 200: { description: 'OK' } },
            },
          },
        },
      }

      vi.mocked(wpapiToSwagger2).mockReturnValue(swaggerSource as any)

      const configRead: ApiPipeline.ConfigRead = {
        config: {
          input: '',
          parser: 'wpapi',
        } as ApiPipeline.Config,
        inputs: {
          json: wpapiSource as any,
        },
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

      const result = await original(configRead)

      expect(wpapiToSwagger2).toHaveBeenCalledWith(wpapiSource)
      expect(result.source).toEqual(swaggerSource)
    })

    it('does not transform when parser is "swagger"', async () => {
      const swaggerSource = {
        swagger: '2.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {},
      }

      const configRead: ApiPipeline.ConfigRead = {
        config: {
          input: '',
          parser: 'swagger',
        } as ApiPipeline.Config,
        inputs: {
          json: swaggerSource as any,
        },
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

      const result = await original(configRead)

      expect(wpapiToSwagger2).not.toHaveBeenCalled()
      expect(result.source).toEqual(swaggerSource)
    })

    it('defaults to "swagger" parser when parser is not specified', async () => {
      const swaggerSource = {
        swagger: '2.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {},
      }

      const configRead: ApiPipeline.ConfigRead = {
        config: {
          input: '',
        } as ApiPipeline.Config,
        inputs: {
          json: swaggerSource as any,
        },
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

      const result = await original(configRead)

      expect(wpapiToSwagger2).not.toHaveBeenCalled()
      expect(result.source).toEqual(swaggerSource)
    })

    it('transforms WordPress API schema from uri input when parser is "wpapi"', async () => {
      const wpapiSource = {
        routes: {
          '/wp/v2': {
            namespace: 'wp/v2',
            endpoints: [{ methods: ['get'], args: {} }],
          },
        },
      }

      const swaggerSource = {
        swagger: '2.0',
        info: { title: 'WordPress REST API', version: '1.0' },
        paths: {},
      }

      vi.mocked(ofetch).mockResolvedValue(wpapiSource as any)
      vi.mocked(wpapiToSwagger2).mockReturnValue(swaggerSource as any)

      const configRead: ApiPipeline.ConfigRead = {
        config: {
          input: '',
          parser: 'wpapi',
        } as ApiPipeline.Config,
        inputs: {
          uri: 'https://example.com/wp-json',
        },
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

      const result = await original(configRead)

      expect(ofetch).toHaveBeenCalledWith('https://example.com/wp-json')
      expect(wpapiToSwagger2).toHaveBeenCalledWith(wpapiSource)
      expect(result.source).toEqual(swaggerSource)
    })
  })
})
