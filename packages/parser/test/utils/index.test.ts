import { describe, expect, it } from 'vitest'
import * as utilsModule from '../../src/utils'

describe('parser/src/utils/index', () => {
  it('exports all utility functions', () => {
    expect(utilsModule).toBeDefined()
    expect(utilsModule).toHaveProperty('varName')
    expect(utilsModule).toHaveProperty('useRefMap')
    expect(utilsModule).toHaveProperty('spliceEnumDescription')
    expect(utilsModule).toHaveProperty('spliceEnumType')
    expect(utilsModule).toHaveProperty('varFiled')
    expect(utilsModule).toHaveProperty('isRequiredParameter')
    expect(utilsModule).toHaveProperty('isParameter')
    expect(utilsModule).toHaveProperty('toUndefField')
    expect(utilsModule).toHaveProperty('signAnyInter')
    expect(utilsModule).toHaveProperty('replaceMainext')
    expect(utilsModule).toHaveProperty('literalFieldsToString')
  })

  it('exports functions are callable', () => {
    expect(typeof utilsModule.varName).toBe('function')
    expect(typeof utilsModule.useRefMap).toBe('function')
    expect(typeof utilsModule.spliceEnumDescription).toBe('function')
    expect(typeof utilsModule.spliceEnumType).toBe('function')
    expect(typeof utilsModule.varFiled).toBe('function')
    expect(typeof utilsModule.isRequiredParameter).toBe('function')
    expect(typeof utilsModule.isParameter).toBe('function')
    expect(typeof utilsModule.toUndefField).toBe('function')
    expect(typeof utilsModule.signAnyInter).toBe('function')
    expect(typeof utilsModule.replaceMainext).toBe('function')
    expect(typeof utilsModule.literalFieldsToString).toBe('function')
  })
})
