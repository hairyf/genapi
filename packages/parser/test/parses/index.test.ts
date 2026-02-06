import { describe, expect, it } from 'vitest'
import * as parsesModule from '../../src/parses'

describe('parser/src/parses/index', () => {
  it('exports all parse functions', () => {
    expect(parsesModule).toBeDefined()
    expect(parsesModule).toHaveProperty('parseHeaderCommits')
    expect(parsesModule).toHaveProperty('parseOpenapiSpecification')
    expect(parsesModule).toHaveProperty('parseMethodParameters')
    expect(parsesModule).toHaveProperty('parseMethodMetadata')
    expect(parsesModule).toHaveProperty('parseParameterFiled')
    expect(parsesModule).toHaveProperty('parseSchemaType')
  })

  it('exports functions are callable', () => {
    expect(typeof parsesModule.parseHeaderCommits).toBe('function')
    expect(typeof parsesModule.parseOpenapiSpecification).toBe('function')
    expect(typeof parsesModule.parseMethodParameters).toBe('function')
    expect(typeof parsesModule.parseMethodMetadata).toBe('function')
    expect(typeof parsesModule.parseParameterFiled).toBe('function')
    expect(typeof parsesModule.parseSchemaType).toBe('function')
  })
})
