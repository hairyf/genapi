import type { ApiPipeline } from '@genapi/shared'
import pPipe from 'p-pipe'
import { compiler } from '../compiler'
import { config } from '../config'
import { dest } from '../dest'
import { generate } from '../generate'
import { original } from '../original'

/**
 * Pipeline read (input) step: turns raw config into internal config + inputs.
 */
export type PipelineRead<Config, ConfigRead> = (config: Config) => ConfigRead | Promise<ConfigRead>
/**
 * Middle step that receives and returns config read; used for original, parser, compiler, generate.
 */
export type PipelineFlow<ConfigRead> = (configRead: ConfigRead) => ConfigRead | Promise<ConfigRead>
/**
 * Pipeline dest (output) step: writes files from config read.
 */
export type PipelineDest<ConfigRead> = (configRead: ApiPipeline.ConfigRead) => void

/**
 * Builds a GenAPI pipeline from five steps: config → original → parser → compiler → generate → dest.
 *
 * @param config - Reads config and returns ConfigRead
 * @param original - Fetches source (e.g. OpenAPI JSON)
 * @param parser - Parses source into graphs
 * @param compiler - Compiles graphs to AST
 * @param generate - Generates code string
 * @param dest - Writes output files
 * @returns A function that runs the pipeline for a given config
 * @group Pipeline
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
