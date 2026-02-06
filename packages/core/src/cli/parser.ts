import type { ApiPipeline } from '@genapi/shared'
import type { CAC } from 'cac'
import path, { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { cloneDeep, isUndefined, merge } from '@hairy/utils'

import fs from 'fs-extra'
import { isNetworkUrl } from './utils'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export function readpack(cli: CAC) {
  const pkgPath = join(__dirname, '../package.json')

  if (fs.existsSync(pkgPath))
    cli.version(fs.readJSONSync(pkgPath).version)

  cli.help()
}

export function options(options: any): Partial<ApiPipeline.Config> {
  const config: any = {}
  if (options.preset)
    config.preset = options.preset
  if (options.input) {
    if (isNetworkUrl(options.input))
      config.input = { uri: options.input }
    else
      config.input = { json: options.input }

    if (options.outfile)
      config.output = { main: options.outfile }
  }

  return config
}

export function servers(config: ApiPipeline.DefineConfig | undefined): ApiPipeline.Config[] {
  if (!config)
    return []

  if (isUndefined((config as ApiPipeline.ConfigServers).servers))
    (config as ApiPipeline.ConfigServers).servers = []

  const servers = (config as ApiPipeline.ConfigServers).servers as ApiPipeline.ConfigServers['servers']

  delete (config as any).servers

  if ((config as ApiPipeline.Config).input)
    servers.push((config as ApiPipeline.Config))

  for (let index = 0; index < servers.length; index++)
    servers[index] = merge(cloneDeep(config), servers[index])

  return servers
}
