import { parseOpenapiSpecification } from '@genapi/parser'
import { provide } from '@genapi/shared'
import { beforeEach, describe, expect, it } from 'vitest'

import { swagger2Minimal } from '../../../parser/test/fixtures/swagger2-minimal'
import * as uniModule from '../../src/uni'

describe('presets/src/uni', () => {
  beforeEach(() => {
    provide({ interfaces: [], functions: [], configRead: undefined })
  })

  it('exports js preset', () => {
    expect(uniModule).toHaveProperty('js')
    expect(uniModule.js).toBeDefined()
  })

  it('exports ts preset', () => {
    expect(uniModule).toHaveProperty('ts')
    expect(uniModule.ts).toBeDefined()
  })

  it('js preset has config, parser, compiler, generate, dest, original', () => {
    expect(uniModule.js).toHaveProperty('config')
    expect(uniModule.js).toHaveProperty('parser')
    expect(typeof uniModule.js.config).toBe('function')
    expect(typeof uniModule.js.parser).toBe('function')
  })

  it('ts preset has config, parser, compiler, generate, dest, original', () => {
    expect(uniModule.ts).toHaveProperty('config')
    expect(uniModule.ts).toHaveProperty('parser')
    expect(typeof uniModule.ts.config).toBe('function')
    expect(typeof uniModule.ts.parser).toBe('function')
  })

  it('js preset can be called as function', async () => {
    const source = parseOpenapiSpecification(swagger2Minimal)
    // Use json object directly to avoid file loading
    const result = await uniModule.js({
      input: {
        json: source,
      },
      output: {
        main: 'test/fixtures/generated/test-output.js',
        type: false, // Disable type file to avoid file operations
      },
    } as any)
    // dest function doesn't return a value, so result is undefined
    expect(result).toBeUndefined()
  })

  it('ts preset can be called as function', async () => {
    const source = parseOpenapiSpecification(swagger2Minimal)
    // Use json object directly to avoid file loading
    const result = await uniModule.ts({
      input: {
        json: source,
      },
      output: {
        main: 'test/fixtures/generated/test-output.ts',
        type: false, // Disable type file to avoid file operations
      },
    } as any)
    // dest function doesn't return a value, so result is undefined
    expect(result).toBeUndefined()
  })
})
