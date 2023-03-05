import { spliceEnumDescription, spliceEnumType, traversePaths, useRefMap, varName } from '../src'
import { MockOpenAPIPath } from './mock'

describe('apipgen:swag-parser', () => {
  it('format', () => {
    expect(varName('d1')).toBe('D1')
    expect(varName('Post/#PET/pet/id/upload/ImagePath')).toBe('PostPetPetIdUploadImagePath')
    expect(varName('中文')).toBe('ZhongWen')
    expect(varName('Post/中文/ddd')).toBe('PostZhongWenDdd')
    expect(useRefMap('aaa/Post')).toBe('Post')
    expect(spliceEnumDescription('type', ['q', 'b'])).toBe('@param ?type=q,b | type=q&type=b')
    expect(spliceEnumType(['a', 'b'])).toBe('("a" | "b")[]')
  })
  it('traverse', () => {
    traversePaths({ '/pet': MockOpenAPIPath } as any, (_config) => {
      const pathClose = { ...MockOpenAPIPath.post }
      delete (pathClose as any).parameters

      expect(_config).toEqual({
        path: '/pet',
        method: 'post',
        parameters: MockOpenAPIPath.post.parameters,
        options: pathClose,
      })
    })
  })
})
