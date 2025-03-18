/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-var-requires */
import path from 'node:path'
import { cwd } from 'node:process'
import type { ApiPipeline } from '@genapi/config'

export function inPipeline(pipe: string): ApiPipeline.Pipeline | undefined {
  const inputs = [`@genapi/${pipe}`, `genapi-${pipe}`, absolutePath(pipe)]

  for (const input of inputs) {
    try {
      const inputModule = require('jiti')(cwd())(input)
      const pipeline = inputModule.default || inputModule
      if (pipeline)
        return pipeline
    }
    catch {}
  }
}

export function absolutePath(_path: string) {
  if (path.isAbsolute(_path))
    return _path
  else
    return path.resolve(cwd(), _path)
}
