import type { PathMethod } from '../src'
import { V2Souce } from './mock'

export function packMethodPath(path: string, method: string) {
  const data = {
    method,
    path,
    options: (V2Souce.paths as any)[path][method] as any,
    parameters: (V2Souce.paths as any)[path][method].parameters as any,
    responses: (V2Souce.paths as any)[path][method].responses as any,
  }
  return data as unknown as PathMethod
}
