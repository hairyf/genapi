import { describe, expect, it } from 'vitest'
import { config } from '../../../src/tanstack/colada/config'

describe('tanstack/colada config', () => {
  it('adds useQuery and useMutation import from @pinia/colada', () => {
    const configRead = config({
      input: 'test.json',
    } as any)

    const coladaImport = configRead.graphs.imports.find(
      i => i.value === '@pinia/colada' && i.names?.includes('useQuery') && i.names?.includes('useMutation'),
    )
    expect(coladaImport).toBeDefined()
    expect(coladaImport?.names).toContain('useQuery')
    expect(coladaImport?.names).toContain('useMutation')
  })
})
