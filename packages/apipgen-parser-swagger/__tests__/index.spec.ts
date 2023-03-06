/* eslint-disable no-template-curly-in-string */
import { parseHeaderCommits, parseMethodMetadata, parseMethodParameters, parseParameterFiled, parseSchemaType, spliceEnumDescription, spliceEnumType, traversePaths, useRefMap, varName } from '../src'
import { V2Souce } from './mock'
import { packMethodPath } from './utils'

describe('apipgen:swag-parser', () => {
  it('format All', () => {
    expect(varName('d1')).toBe('D1')
    expect(varName('Post/#PET/pet/id/upload/ImagePath')).toBe('PostPetPetIdUploadImagePath')
    expect(varName('中文')).toBe('ZhongWen')
    expect(varName('Post/中文/ddd')).toBe('PostZhongWenDdd')
    expect(useRefMap('aaa/Post')).toBe('Post')
    expect(spliceEnumDescription('type', ['q', 'b'])).toBe('@param type \'q,b\' | \'type=q&type=b\'')
    expect(spliceEnumType(['a', 'b'])).toBe('(\'a\' | \'b\')[]')
  })
  it('traverse Paths', () => {
    traversePaths({ '/pet': V2Souce.paths['/pet'] } as any, (_config) => {
      expect(_config).toEqual({
        path: '/pet',
        method: _config.method,
        parameters: (V2Souce.paths['/pet'] as any)[_config.method].parameters,
        options: (V2Souce.paths['/pet'] as any)[_config.method],
        responses: (V2Souce.paths['/pet'] as any)[_config.method].responses,
      })
    })
  })
  it('parse Header Commits', () => {
    expect(parseHeaderCommits(V2Souce as any)).toEqual([
      '@title Swagger Petstore',
      '@description This is a sample server Petstore server.  You can find out more about Swagger at [http://swagger.io](http://swagger.io) or on [irc.freenode.net, #swagger](http://swagger.io/irc/).  For this sample, you can use the api key `special-key` to test the authorization filters.',
      '@swagger 2.0',
      '@version 1.0.6',
    ])
  })

  it('parse Method Metadata', () => {
    expect(parseMethodMetadata(packMethodPath('/store/order/{orderId}', 'get'))).toEqual({
      name: 'getStoreOrderOrderId',
      url: '/store/order/${paths.orderId}',
      description: [
        '@summary Find purchase order by ID',
        '@description For valid response try integer IDs with value >= 1 and <= 10. Other values will generated exceptions',
        '@method get',
        '@tags store',
      ],
      body: [],
      responseType: 'Order',
    })
  })

  it('parse Method Parameters', () => {
    expect(parseMethodParameters(packMethodPath('/store/order/{orderId}', 'get'))).toEqual({
      options: [],
      interfaces: [
        {
          export: true,
          name: 'GetStoreOrderOrderIdPath',
          properties: [
            {
              name: 'orderId',
              type: 'number',
              description: '@description ID of pet that needs to be fetched',
              required: true,
            },
          ],
        },
      ],
      parameters: [
        { name: 'paths', type: 'GetStoreOrderOrderIdPath', required: true },
      ],
    })
    expect(parseMethodParameters(packMethodPath('/pet/{petId}', 'post'))).toEqual({
      options: ['body'],
      interfaces: [
        {
          export: true,
          name: 'PostPetPetIdPath',
          properties: [
            {
              name: 'petId',
              type: 'number',
              description: '@description ID of pet that needs to be updated',
              required: true,
            },
          ],
        },
      ],
      parameters: [
        { name: 'body', type: 'FormData', required: true },
        { name: 'paths', type: 'PostPetPetIdPath', required: true },
      ],
    })
    expect(parseMethodParameters(packMethodPath('/pet/{petId}', 'delete'), { header: 'headerss' })).toEqual({
      options: ['headerss'],
      interfaces: [
        {
          export: true,
          name: 'DeletePetPetIdPath',
          properties: [
            {
              name: 'petId',
              type: 'number',
              description: '@description Pet id to delete',
              required: true,
            },
          ],
        },
        {
          export: true,
          name: 'DeletePetPetIdHeader',
          properties: [
            {
              name: 'api_key',
              type: 'string',
              required: false,
            },
            {
              name: '[key: string]',
              type: 'any',
              required: true,
            },
          ],
        },
      ],
      parameters: [
        { name: 'paths', type: 'DeletePetPetIdPath', required: true },
        { name: 'headerss', type: 'DeletePetPetIdHeader', required: false },
      ],
    })
  })

  it('parse Parameter Filed', () => {
    expect(parseParameterFiled(V2Souce.paths['/pet/findByStatus'].get.parameters[0] as any))
      .toEqual({
        name: 'status',
        type: 'string | (\'available\' | \'pending\' | \'sold\')[]',
        description: [
          '@description Status values that need to be considered for filter',
          '@param status \'available,pending,sold\' | \'status=available&status=pending&status=sold\'',
        ],
        required: true,
      })
  })

  it('parse Schema Types', () => {
    expect(parseSchemaType({ originalRef: '#User' })).toBe('User')
    expect(parseSchemaType({ $ref: '#/definitions/Order' })).toBe('Order')
    expect(parseSchemaType({ schema: { $ref: '#/definitions/Order' } })).toBe('Order')
    expect(parseSchemaType({ additionalProperties: { $ref: '#/definitions/Pet' } })).toBe('Record<string, Pet>')
    expect(parseSchemaType({})).toBe('any')
    expect(parseSchemaType({ type: 'boolean' })).toBe('boolean')
    expect(parseSchemaType({ type: 'array', items: { originalRef: '#Pet' } })).toBe('Pet[]')
    expect(parseSchemaType({ type: ['string', 'integer'] })).toBe('string | number')
    expect(parseSchemaType({ type: ['string', 'dateTime'] })).toBe('string')
    expect(parseSchemaType({ type: 'array', items: { type: ['string', 'integer'] } })).toBe('(string | number)[]')
  })
})
