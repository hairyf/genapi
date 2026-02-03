import { describe, expect, it } from 'vitest'
import { transformHeaderOptions } from '../../src/transform/headers'

describe('transformHeaderOptions', () => {
  it('unshifts headers with application/json when parameter exists and type is not FormData', () => {
    const options: any[] = ['body']
    const parameters = [
      { name: 'headers', type: 'Record', required: false },
    ]
    transformHeaderOptions('headers', { options, parameters })
    expect(options[0]).toEqual(['headers', expect.stringContaining('application/json')])
    expect(options[0][1]).not.toContain('multipart/form-data')
  })

  it('unshifts headers with multipart/form-data when parameter type is FormData', () => {
    const options: any[] = []
    const parameters = [
      { name: 'headers', type: 'FormData', required: true },
    ]
    transformHeaderOptions('headers', { options, parameters })
    expect(options[0][1]).toContain('multipart/form-data')
  })

  it('replaces existing "headers" option with spread when present', () => {
    const options: any[] = ['headers', 'body']
    const parameters = [
      { name: 'headers', type: 'object', required: false },
    ]
    transformHeaderOptions('headers', { options, parameters })
    expect(options).not.toContain('headers')
    expect(options[0][1]).toContain('...headers')
  })

  it('does nothing when parameter not found', () => {
    const options: any[] = ['body']
    const parameters = [
      { name: 'body', type: 'object', required: true },
    ]
    transformHeaderOptions('headers', { options, parameters })
    expect(options).toEqual(['body'])
  })
})
