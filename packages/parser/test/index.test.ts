import { describe, expect, it } from 'vitest'
import * as parserModule from '../src/index'

describe('parser/src/index', () => {
  it('exports parser module', () => {
    expect(parserModule).toBeDefined()
    expect(typeof parserModule).toBe('object')
  })

  it('exports createParser function', () => {
    expect(parserModule).toHaveProperty('createParser')
    expect(typeof parserModule.createParser).toBe('function')
  })

  it('exports parse functions from parses', () => {
    expect(parserModule).toHaveProperty('parseHeaderCommits')
    expect(parserModule).toHaveProperty('parseOpenapiSpecification')
    expect(parserModule).toHaveProperty('parseMethodParameters')
    expect(parserModule).toHaveProperty('parseMethodMetadata')
  })

  it('exports transform functions', () => {
    expect(parserModule).toHaveProperty('transformBodyStringify')
    expect(parserModule).toHaveProperty('transformDefinitions')
    expect(parserModule).toHaveProperty('transformHeaderOptions')
    expect(parserModule).toHaveProperty('transformOperation')
    expect(parserModule).toHaveProperty('transformParameters')
    expect(parserModule).toHaveProperty('transformBaseURL')
  })

  it('exports traverse functions', () => {
    expect(parserModule).toHaveProperty('traversePaths')
  })

  it('exports utility functions', () => {
    expect(parserModule).toHaveProperty('varName')
    expect(parserModule).toHaveProperty('isRequiredParameter')
    expect(parserModule).toHaveProperty('isParameter')
  })
})
