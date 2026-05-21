import type { ApiPipeline } from '@genapi/shared'
import process from 'node:process'
import { merge } from '@hairy/utils'
import { loadConfig } from 'c12'
import { defineCommand, runMain } from 'citty'
import { generate } from '../generator'
import { initCommand } from './init'
import * as parser from './parser'

let isInitCommand = false
const main = defineCommand({
  meta: {
    name: 'genapi',
    description: 'Generate API client from OpenAPI/Swagger',
    version: parser.getVersion(),
  },
  args: {
    preset: {
      type: 'string',
      description: 'The compilation preset used supports npm package (add the prefix genapi -) | local path',
    },
    input: {
      type: 'positional',
      description: 'The incoming string resolves to a uri or json path.',
      required: false,
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
      run: async () => {
        isInitCommand = true
        return initCommand()
      },
    }),
  },
  async run({ args }) {
    if (isInitCommand) {
      return
    }

    const options = {
      preset: args.preset,
      input: args.input,
      outfile: args.outfile,
    }

    const cliOptions = parser.options(options)

    const loadConfigOptions = {
      name: 'genapi',
      merger: (defaults: any, ...sources: any[]) => {
        const merged = merge(defaults, ...sources)
        return merge(cliOptions, merged)
      },
    }

    let result = await loadConfig<ApiPipeline.DefineConfig>({
      ...loadConfigOptions,
      configFile: 'api.config',
    })

    if (!result._configFile) {
      result = await loadConfig<ApiPipeline.DefineConfig>({
        ...loadConfigOptions,
        configFile: 'genapi.config',
      })
    }

    const { config } = result

    if (!config || !result._configFile) {
      console.error('Error: genapi config file not found')
      console.log('\nTip: run "genapi init" to create config file\n')
      process.exit(1)
    }

    const servers = parser.servers(config)
    await generate(servers)
  },
})

runMain(main)
