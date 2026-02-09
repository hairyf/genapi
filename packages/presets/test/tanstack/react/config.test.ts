import { describe, expect, it } from 'vitest'
import { config } from '../../../src/tanstack/react/config'

describe('tanstack/react config', () => {
  it('adds useQuery and useMutation import from @tanstack/react-query', () => {
    const configRead = config({
      input: 'test.json',
    } as any)

    const queryImport = configRead.graphs.scopes.main.imports.find(
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
    expect(configRead.graphs.scopes.main.imports.some(i => i.value === '@tanstack/react-query')).toBe(true)
  })

  it('query preset defaults to three outputs: main (hooks), api (apis), type (types)', () => {
    const configRead = config({ input: 'test.json' } as any)
    expect(configRead.outputs).toHaveLength(3)
    expect(configRead.outputs?.map(o => o.type).sort()).toEqual(['api', 'main', 'type'])
    const main = configRead.outputs?.find(o => o.type === 'main')
    const api = configRead.outputs?.find(o => o.type === 'api')
    const type = configRead.outputs?.find(o => o.type === 'type')
    expect(main?.path).toMatch(/[\\/]src[\\/]api[\\/]index\.ts$/)
    expect(api?.path).toMatch(/[\\/]src[\\/]api[\\/]index\.api\.ts$/)
    expect(type?.path).toMatch(/[\\/]src[\\/]api[\\/]index\.type\.ts$/)
    expect(configRead.graphs.scopes.main.imports.some(i => i.name === 'Api')).toBe(true)
    expect(configRead.graphs.scopes.api?.imports.some(i => i.name === 'Types')).toBe(true)
  })

  it('respects output.main, output.api, output.type when set (query only)', () => {
    const configRead = config({
      input: 'test.json',
      output: {
        main: 'lib/hooks.ts',
        api: 'lib/apis.ts',
        type: 'lib/types.ts',
      },
    } as any)
    expect(configRead.outputs).toHaveLength(3)
    expect(configRead.outputs?.find(o => o.type === 'main')?.path).toMatch(/[\\/]lib[\\/]hooks\.ts$/)
    expect(configRead.outputs?.find(o => o.type === 'api')?.path).toMatch(/[\\/]lib[\\/]apis\.ts$/)
    expect(configRead.outputs?.find(o => o.type === 'type')?.path).toMatch(/[\\/]lib[\\/]types\.ts$/)
  })

  it('type: false yields single main output (no api/type)', () => {
    const configRead = config({
      input: 'test.json',
      output: { main: 'src/api.ts', type: false },
    } as any)
    expect(configRead.outputs).toHaveLength(1)
    expect(configRead.outputs?.[0].type).toBe('main')
  })
})
