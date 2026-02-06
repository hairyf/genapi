import { parseOpenapiSpecification } from '@genapi/parser'
import { provide } from '@genapi/shared'
import { beforeEach, describe, expect, it } from 'vitest'

import { swagger2Minimal } from '../../../parser/test/fixtures/swagger2-minimal'
import * as tanstack from '../../src/tanstack'

describe('tanstack integration', () => {
  beforeEach(() => {
    provide({ interfaces: [], functions: [], configRead: undefined })
  })

  it('react preset generates fetcher and useQuery hook in code', async () => {
    const source = parseOpenapiSpecification(swagger2Minimal)
    const config = {
      input: { json: source },
      output: { main: 'src/api.ts', type: false },
    } as any

    const configRead = tanstack.react.config(config)
    configRead.source = source
    configRead.inputs = {}
    const afterParser = tanstack.react.parser(configRead)
    const afterCompiler = tanstack.react.compiler(afterParser)
    const afterGenerate = await tanstack.react.generate(afterCompiler)

    const output = afterGenerate.outputs?.find(o => o.type === 'request')
    expect(output?.code).toBeDefined()
    expect(output!.code).toContain('@tanstack/react-query')
    expect(output!.code).toContain('useQuery')
    expect(output!.code).toContain('useMutation')
    expect(output!.code).toContain('getPets')
    expect(output!.code).toContain('useGetPets')
    expect(output!.code).toContain('queryKey')
    expect(output!.code).toContain('queryFn')
  })

  it('vue preset generates fetcher and useQuery hook in code', async () => {
    const source = parseOpenapiSpecification(swagger2Minimal)
    const config = {
      input: { json: source },
      output: { main: 'src/api.ts', type: false },
    } as any

    const configRead = tanstack.vue.config(config)
    configRead.source = source
    configRead.inputs = {}
    const afterParser = tanstack.vue.parser(configRead)
    const afterCompiler = tanstack.vue.compiler(afterParser)
    const afterGenerate = await tanstack.vue.generate(afterCompiler)

    const output = afterGenerate.outputs?.find(o => o.type === 'request')
    expect(output?.code).toBeDefined()
    expect(output!.code).toContain('@tanstack/vue-query')
    expect(output!.code).toContain('useQuery')
    expect(output!.code).toContain('useMutation')
    expect(output!.code).toContain('getPets')
    expect(output!.code).toContain('useGetPets')
    expect(output!.code).toContain('queryKey')
    expect(output!.code).toContain('queryFn')
  })
})
