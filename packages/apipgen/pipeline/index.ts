import pPipe from 'p-pipe'
import type ApiPipeline from '../typings'

/**
 * Pipeline read（input）function
 */
export type PipelineRead = (config: ApiPipeline.Config) => ApiPipeline.ConfigRead | Promise<ApiPipeline.ConfigRead>
/**
 * Transfer data in pipeline
 */
export type PipelineFlow = (configRead: ApiPipeline.ConfigRead) => ApiPipeline.ConfigRead | Promise<ApiPipeline.ConfigRead>
/**
 * Pipeline dest（output）function
 */
export type PipelineDest = (configRead: ApiPipeline.ConfigRead) => void

/**
 * create apipgen pipeline process
 * @param readConfig read config pa
 * @param original get the source according to config
 * @param parser resolve source as available data
 * @param compiler compile parse info conversion AST tree
 * @param generate generate code
 * @param dest dest file
 * @returns
 */
export function pipeline(
  readConfig: PipelineRead,
  original: PipelineFlow,
  parser: PipelineFlow,
  compiler: PipelineFlow,
  generate: PipelineFlow,
  dest: PipelineDest,
) {
  const pipe = pPipe(
    readConfig,
    original,
    parser,
    compiler,
    generate,
    dest,
  )

  return pipe as ApiPipeline.Pipeline
}
