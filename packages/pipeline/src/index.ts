import type { PipelineDest, PipelineFlow, PipelineRead } from './pipeline'
import { pipeline } from './pipeline'

export * from './compiler'
export * from './config'
export * from './dest'
export * from './generate'
export * from './original'

export type {
  PipelineDest,
  PipelineFlow,
  PipelineRead,
}

export default pipeline
