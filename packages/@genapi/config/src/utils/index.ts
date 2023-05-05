import type { ApiPipeline } from '../types'

export function replaceMainext(output?: ApiPipeline.PreOutput['output'], ext: 'js' | 'ts' = 'js') {
  const from = ext === 'js' ? 'ts' : 'js'
  const to = ext === 'js' ? ext : 'ts'
  if (typeof output === 'string')
    return output.replace(from, to)
  return output?.main?.replace(from, to)
}
