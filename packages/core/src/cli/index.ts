import type { ApiPipeline } from '@genapi/shared'
import process from 'node:process'
import { merge } from '@hairy/utils'
import { loadConfig } from 'c12'
import { defineCommand, runMain } from 'citty'
import { operatePipelineGenerator } from '../generator'
import { initCommand } from './init'
import * as parser from './parser'

const main = defineCommand({
  meta: {
    name: 'genapi',
    version: parser.getVersion(),
  },
  args: {
    preset: {
      type: 'string',
      description: 'The compilation preset used supports npm package (add the prefix genapi -) | local path',
    },
    input: {
      type: 'string',
      description: 'The incoming string resolves to a uri or json path.',
    },
    outfile: {
      type: 'string',
      description: 'genapi output file options',
    },
  },
  subCommands: {
    init: defineCommand({
      meta: {
        description: 'Initialize genapi config file',
      },
      run: initCommand,
    }),
  },
  async run({ args }) {
    const options = {
      preset: args.preset,
      input: args.input,
      outfile: args.outfile,
    }

    const cliOptions = parser.options(options)
    const { config } = await loadConfig<ApiPipeline.DefineConfig>({
      name: 'genapi',
      configFile: 'genapi.config',
      merger: (defaults: any, ...sources: any[]) => {
        const merged = merge(defaults, ...sources)
        return merge(cliOptions, merged)
      },
    })

    if (!config) {
      console.error('Error: genapi config file not found')
      console.log('\nTip: run "genapi init" to create config file\n')
      process.exit(1)
    }

    const servers = parser.servers(config)
    await operatePipelineGenerator(servers)
  },
})

runMain(main)
