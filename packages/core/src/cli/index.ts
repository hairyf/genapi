import type { ApiPipeline } from '@genapi/shared'
import { merge } from '@hairy/utils'
import cac from 'cac'
import { loadConfig } from 'unconfig'
import { operatePipelineGenerator } from '../generator'
import * as parser from './parser'

const cli = cac('genapi')

cli
  .option('--preset <preset>', 'The compilation preset used supports npm package (add the prefix genapi -) | local path')
  .option('--input <source>', 'The incoming string resolves to a uri or json path.')
  .option('--outfile <path>', 'genapi output file options')

parser.readpack(cli)

main()

async function main() {
  const options = cli.parse().options
  if (options.help)
    return

  const { config } = await loadConfig<ApiPipeline.DefineConfig>({
    sources: {
      files: 'genapi.config',
      rewrite: config => merge(parser.options(options), config) as any,
    },
  })

  const servers = parser.servers(config)
  await operatePipelineGenerator(servers)
}
