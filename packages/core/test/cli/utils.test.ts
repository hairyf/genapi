import { describe, expect, it } from 'vitest'
import { isNetworkUrl } from '../../src/cli/utils'

describe('isNetworkUrl', () => {
  it('returns true for https URL', () => {
    expect(isNetworkUrl('https://api.example.com')).toBe(true)
    expect(isNetworkUrl('https://api.example.com/v1')).toBe(true)
  })

  it('returns true for http URL with domain', () => {
    expect(isNetworkUrl('http://example.com')).toBe(true)
    expect(isNetworkUrl('http://api.example.com')).toBe(true)
  })

  it('returns true for URL without scheme (domain only)', () => {
    expect(isNetworkUrl('api.example.com')).toBe(true)
    expect(isNetworkUrl('example.com')).toBe(true)
  })

  it('returns false for local file path', () => {
    expect(isNetworkUrl('./swagger.json')).toBe(false)
    expect(isNetworkUrl('README')).toBe(false)
  })

  it('returns false for path with spaces', () => {
    expect(isNetworkUrl('path with spaces.json')).toBe(false)
  })

  it('returns false for empty string', () => {
    expect(isNetworkUrl('')).toBe(false)
  })
})
