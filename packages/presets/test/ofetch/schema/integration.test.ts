import { parseOpenapiSpecification } from '@genapi/parser'
import { provide } from '@genapi/shared'
import { beforeEach, describe, expect, it } from 'vitest'
// Use relative path to fixtures
import { swagger2Minimal } from '../../../../parser/test/fixtures/swagger2-minimal'
import { swagger2Parameters } from '../../../../parser/test/fixtures/swagger2-parameters'
import { ofetch } from '../../../src'

describe('ofetch/schema integration', () => {
  beforeEach(() => {
    provide({ interfaces: [], functions: [], configRead: undefined })
  })

  it('generates complete code with schema preset', async () => {
    const source = parseOpenapiSpecification(swagger2Minimal)
    const config = {
      input: 'test.json',
      source,
      graphs: {
        comments: [],
        functions: [],
        imports: [],
        interfaces: [],
        typings: [],
        variables: [],
      },
      inputs: {},
      outputs: [
        {
          type: 'request',
          path: 'dist/index.ts',
        },
      ],
    }

    // Run through the pipeline (skip original since we already have source)
    const configRead = ofetch.schema.config(config as any)
    // Set source directly to avoid URL fetch
    configRead.source = source
    configRead.inputs = {}
    const afterParser = ofetch.schema.parser(configRead)
    const afterCompiler = ofetch.schema.compiler(afterParser)
    const afterGenerate = await ofetch.schema.generate(afterCompiler)

    const output = afterGenerate.outputs[0]
    expect(output.code).toBeDefined()
    expect(output.code).toContain('import { ofetch } from "ofetch"')
    expect(output.code).toContain('interface APISchema')
    expect(output.code).toContain('async function $fetch')
    expect(output.code).toContain('TypedFetchInput<APISchema>')
  })

  it('handles complex schema with multiple paths and parameters', async () => {
    const source = parseOpenapiSpecification(swagger2Parameters)
    const config = {
      input: 'test.json',
      source,
      graphs: {
        comments: [],
        functions: [],
        imports: [],
        interfaces: [],
        typings: [],
        variables: [],
      },
      inputs: {},
      outputs: [
        {
          type: 'request',
          path: 'dist/index.ts',
        },
      ],
    }

    const configRead = ofetch.schema.config(config as any)
    // Set source directly to avoid URL fetch
    configRead.source = source
    configRead.inputs = {}
    const afterParser = ofetch.schema.parser(configRead)
    const afterCompiler = ofetch.schema.compiler(afterParser)

    // Check that routes were collected
    expect((afterParser as any).__schemaRoutes).toBeDefined()
    expect((afterParser as any).__schemaRoutes.length).toBeGreaterThan(0)

    // Check that schema was generated
    const output = afterCompiler.outputs[0]
    expect(output.code).toBeDefined()
    expect(output.code).toContain('interface APISchema')
    expect(output.code).toContain('[DynamicParam]') // Should have dynamic params
  })

  it('generates valid TypeScript code', async () => {
    const source = parseOpenapiSpecification(swagger2Minimal)
    const config = {
      input: 'test.json',
      source,
      graphs: {
        comments: [],
        functions: [],
        imports: [],
        interfaces: [],
        typings: [],
        variables: [],
      },
      inputs: {},
      outputs: [
        {
          type: 'request',
          path: 'dist/index.ts',
        },
      ],
    }

    const configRead = ofetch.schema.config(config as any)
    // Set source directly to avoid URL fetch
    configRead.source = source
    configRead.inputs = {}
    const afterParser = ofetch.schema.parser(configRead)
    const afterCompiler = ofetch.schema.compiler(afterParser)
    const afterGenerate = await ofetch.schema.generate(afterCompiler)

    const output = afterGenerate.outputs[0]
    const code = output.code

    // Basic syntax checks
    expect(code).toContain('import')
    expect(code).toContain('interface')
    expect(code).toContain('function')
    expect(code).toContain('async')
    expect(code).toContain('return')

    // Check for proper closing braces
    const openBraces = (code?.match(/\{/g) || []).length
    const closeBraces = (code?.match(/\}/g) || []).length
    expect(openBraces).toBe(closeBraces)
  })
})
