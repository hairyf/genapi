import { describe, expect, it } from 'vitest'
import { transformBodyStringify } from '../../src/transform/body'

describe('transformBodyStringify', () => {
  it('replaces option with [name, stringify] when parameter exists and is not FormData/any', () => {
    const options: any[] = ['body']
    const parameters = [
      { name: 'body', type: 'CreatePetRequest', required: true },
    ]
    transformBodyStringify('body', { options, parameters })
    expect(options).toHaveLength(1)
    expect(options[0]).toEqual(['body', 'JSON.stringify(body)'])
  })

  it('uses || {} when parameter is not required', () => {
    const options: any[] = ['body']
    const parameters = [
      { name: 'body', type: 'CreatePetRequest', required: false },
    ]
    transformBodyStringify('body', { options, parameters })
    expect(options[0][1]).toContain('|| {}')
  })

  it('does not replace when parameter type is FormData', () => {
    const options: any[] = ['body']
    const parameters = [
      { name: 'body', type: 'FormData', required: true },
    ]
    transformBodyStringify('body', { options, parameters })
    expect(options).toEqual(['body'])
  })

  it('does not replace when parameter type is any', () => {
    const options: any[] = ['body']
    const parameters = [
      { name: 'body', type: 'any', required: true },
    ]
    transformBodyStringify('body', { options, parameters })
    expect(options).toEqual(['body'])
  })

  it('does nothing when option name not in options', () => {
    const options: any[] = ['query']
    const parameters = [{ name: 'body', type: 'object', required: true }]
    transformBodyStringify('body', { options, parameters })
    expect(options).toEqual(['query'])
  })
})
