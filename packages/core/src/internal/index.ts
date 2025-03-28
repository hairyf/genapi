import type { ApiPipeline } from '@genapi/shared'
import path from 'node:path'
import { cwd } from 'node:process'
import createJiti from 'jiti'

const jiti = createJiti(cwd())
export function inPipeline(pipe: string | ApiPipeline.Pipeline): ApiPipeline.Pipeline | undefined {
  if (typeof pipe === 'function')
    return pipe as ApiPipeline.Pipeline

  const inputs = [`@genapi/presets/${pipe}`, `genapi-${pipe}`, pipe, absolutePath(pipe)]

  for (const input of inputs) {
    try {
      const inputModule = jiti(input)
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
