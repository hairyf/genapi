import cac from 'cac'
import { loadConfig } from 'unconfig'
import merge from 'lodash/merge'
import type { ApiPipeline } from '@genapi/config'
import { openPipeWebClientGenerator } from '@genapi/core'
import { pack, parseOptions, parseServers } from '../utils'

const cli = cac('genapi')

cli
  .option('--pipe <pipeline>', 'The compilation pipeline used supports npm package (add the prefix genapi -) | local path')
  .option('--input <source>', 'The incoming string resolves to a uri or json path.')
  .option('--outfile <path>', 'genapi output file options')

pack(cli)

actionApiGenerator()

async function actionApiGenerator() {
  const options = cli.parse().options
  if (options.help)
    return

  const { config } = await loadConfig<ApiPipeline.DefineConfig>({
    sources: {
      files: 'genapi.config',
      rewrite: config => merge(parseOptions(options), config),
    },
  })

  const servers = parseServers(config)

  await openPipeWebClientGenerator(servers)
}
