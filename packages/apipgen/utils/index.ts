import path from 'path'
import { cwd } from 'process'
import type ApiPipeline from '../typings'

export function inPipeline(pipe: string): ApiPipeline.Pipeline | undefined {
  const inputs = [`apipgen-${pipe}`, absolutePath(pipe)]
  for (const input of inputs) {
    if (require(input))
      return require(input)
  }
}

export function absolutePath(_path: string) {
  if (path.isAbsolute(_path))
    return _path
  else
    return path.resolve(cwd(), _path)
}
