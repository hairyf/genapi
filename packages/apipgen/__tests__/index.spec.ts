import { parseOptions, parseServers } from '../bin/utils'

describe('apipgen:core', () => {
  it('parseServers config merge', () => {
    const servers = parseServers({
      pipeline: 'swag-axios-js',
      servers: [
        { input: '1' },
        { input: '2' },
      ],
    })
    expect(servers).toEqual([
      { input: '1', pipeline: 'swag-axios-js' },
      { input: '2', pipeline: 'swag-axios-js' },
    ])
  })

  it('parseServers config merge deep', () => {
    const servers = parseServers({
      import: { http: '1' },
      servers: [
        { input: '1', import: { http: '2' } },
        { input: '2', import: { type: '2' } },
      ],
    })
    expect(servers).toEqual([
      { input: '1', import: { http: '2' } },
      { input: '2', import: { http: '1', type: '2' } },
    ])
  })

  it('parseOptions to config', () => {
    const config = parseOptions({
      pipe: '1',
    })
    expect(config).toEqual({ pipeline: '1' })
  })

  it('parseOptions to input uri', () => {
    const swaggerUri = 'https://petstore.swagger.io/v2/swagger.json'
    const config = parseOptions({
      input: swaggerUri,
    })
    expect(config).toEqual({ input: { uri: swaggerUri } })
  })

  it ('parseOptions to input json', () => {
    const config = parseOptions({
      input: './a.json',
    })
    expect(config).toEqual({ input: { json: './a.json' } })
  })
})
