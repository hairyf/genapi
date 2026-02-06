import type { ApiPipeline } from '@genapi/shared'
import fs from 'fs-extra'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { dest } from '../../src/dest'

// Mock fs-extra
vi.mock('fs-extra', () => ({
  default: {
    ensureDir: vi.fn().mockResolvedValue(undefined),
    writeFile: vi.fn().mockResolvedValue(undefined),
  },
}))

describe('dest', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('writes output files for each output', async () => {
    const configRead: ApiPipeline.ConfigRead = {
      config: {
        input: '',
      } as ApiPipeline.Config,
      inputs: {},
      outputs: [
        {
          type: 'request',
          root: './dist',
          path: './dist/index.ts',
          code: 'export const api = {}',
        },
        {
          type: 'typings',
          root: './dist',
          path: './dist/types.d.ts',
          code: 'export type User = {}',
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

    await dest(configRead)

    expect(fs.ensureDir).toHaveBeenCalledTimes(2)
    expect(fs.ensureDir).toHaveBeenCalledWith('./dist')
    expect(fs.writeFile).toHaveBeenCalledTimes(2)
    expect(fs.writeFile).toHaveBeenCalledWith('./dist/index.ts', 'export const api = {}', { flag: 'w' })
    expect(fs.writeFile).toHaveBeenCalledWith('./dist/types.d.ts', 'export type User = {}', { flag: 'w' })
  })

  it('handles empty code string', async () => {
    const configRead: ApiPipeline.ConfigRead = {
      config: {
        input: '',
      } as ApiPipeline.Config,
      inputs: {},
      outputs: [
        {
          type: 'request',
          root: './dist',
          path: './dist/index.ts',
          code: '',
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

    await dest(configRead)

    expect(fs.writeFile).toHaveBeenCalledWith('./dist/index.ts', '', { flag: 'w' })
  })

  it('handles undefined code', async () => {
    const configRead: ApiPipeline.ConfigRead = {
      config: {
        input: '',
      } as ApiPipeline.Config,
      inputs: {},
      outputs: [
        {
          type: 'request',
          root: './dist',
          path: './dist/index.ts',
          code: undefined,
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

    await dest(configRead)

    expect(fs.writeFile).toHaveBeenCalledWith('./dist/index.ts', '', { flag: 'w' })
  })

  it('handles empty outputs array', async () => {
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

    await dest(configRead)

    expect(fs.ensureDir).not.toHaveBeenCalled()
    expect(fs.writeFile).not.toHaveBeenCalled()
  })

  it('ensures directory before writing file', async () => {
    const configRead: ApiPipeline.ConfigRead = {
      config: {
        input: '',
      } as ApiPipeline.Config,
      inputs: {},
      outputs: [
        {
          type: 'request',
          root: './custom/dist',
          path: './custom/dist/index.ts',
          code: 'export const api = {}',
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

    await dest(configRead)

    expect(fs.ensureDir).toHaveBeenCalledWith('./custom/dist')
    expect(fs.writeFile).toHaveBeenCalledWith('./custom/dist/index.ts', 'export const api = {}', { flag: 'w' })
  })
})
