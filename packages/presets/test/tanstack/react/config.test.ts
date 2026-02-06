import { describe, expect, it } from 'vitest'
import { config } from '../../../src/tanstack/react/config'

describe('tanstack/react config', () => {
  it('adds useQuery and useMutation import from @tanstack/react-query', () => {
    const configRead = config({
      input: 'test.json',
    } as any)

    const queryImport = configRead.graphs.imports.find(
      i => i.value === '@tanstack/react-query' && i.names?.includes('useQuery') && i.names?.includes('useMutation'),
    )
    expect(queryImport).toBeDefined()
    expect(queryImport?.names).toContain('useQuery')
    expect(queryImport?.names).toContain('useMutation')
  })

  it('merges user meta and preserves pipeline config', () => {
    const configRead = config({
      input: 'test.json',
      output: { main: 'src/api.ts' },
    } as any)

    expect(configRead.outputs).toBeDefined()
    expect(configRead.outputs!.length).toBeGreaterThanOrEqual(1)
    expect(configRead.graphs.imports.some(i => i.value === '@tanstack/react-query')).toBe(true)
  })
})
