import type { ApiPipeline } from '@genapi/shared'
import pPipe from 'p-pipe'
import { compiler } from '../compiler'
import { config } from '../config'
import { dest } from '../dest'
import { generate } from '../generate'
import { original } from '../original'

/**
 * Pipeline read（input）function
 */
export type PipelineRead<Config, ConfigRead> = (config: Config) => ConfigRead | Promise<ConfigRead>
/**
 * Transfer data in pipeline
 */
export type PipelineFlow<ConfigRead> = (configRead: ConfigRead) => ConfigRead | Promise<ConfigRead>
/**
 * Pipeline dest（output）function
 */
export type PipelineDest<ConfigRead> = (configRead: ApiPipeline.ConfigRead) => void

/**
 * create genapi pipeline process
 * @param config read config pa
 * @param original get the source according to config
 * @param parser resolve source as available data
 * @param compiler compile parse info conversion AST tree
 * @param generate generate code
 * @param dest dest file
 */
export function pipeline<Config = ApiPipeline.Config, ConfigRead = ApiPipeline.ConfigRead>(
  config: PipelineRead<Config, ConfigRead>,
  original: PipelineFlow<ConfigRead>,
  parser: PipelineFlow<ConfigRead>,
  compiler: PipelineFlow<ConfigRead>,
  generate: PipelineFlow<ConfigRead>,
  dest: PipelineDest<ConfigRead>,
) {
  const pipe = pPipe(
    config,
    original,
    parser,
    compiler,
    generate,
    dest,
  )

  return pipe as ApiPipeline.Pipeline
}
pipeline.config = config
pipeline.original = original
pipeline.parser = original
pipeline.compiler = compiler
pipeline.generate = generate
pipeline.dest = dest
