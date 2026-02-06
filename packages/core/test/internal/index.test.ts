import path from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import { absolutePath, inPipeline } from '../../src/internal'

describe('absolutePath', () => {
  it('returns path as-is when already absolute', () => {
    const abs = path.resolve('/foo/bar')
    expect(absolutePath(abs)).toBe(abs)
  })

  it('resolves relative path against cwd', () => {
    const result = absolutePath('genapi.config.ts')
    expect(path.isAbsolute(result)).toBe(true)
    expect(result.endsWith('genapi.config.ts')).toBe(true)
  })
})

describe('inPipeline', () => {
  it('returns function when pipe is already a function', () => {
    const fn = vi.fn()
    expect(inPipeline(fn as any)).toBe(fn)
  })

  it('returns undefined for non-resolvable string without throwing', () => {
    expect(inPipeline('non-existent-package-name-xyz')).toBeUndefined()
  })

  it('tries multiple input paths when resolving preset', () => {
    // The function tries: @genapi/presets/${pipe}, genapi-${pipe}, pipe, absolutePath(pipe)
    // We test that it doesn't crash when trying these paths
    // Using a non-existent preset to avoid side effects
    const result = inPipeline('non-existent-preset-xyz-123')
    expect(result).toBeUndefined()
  })
})
