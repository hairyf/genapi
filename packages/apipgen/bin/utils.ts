import { join } from 'path'
import fs from 'fs-extra'
import type { CAC } from 'cac'
import merge from 'lodash/merge'
import isUndefined from 'lodash/isUndefined'
import cloneDeep from 'lodash/cloneDeep'
import type ApiPipeline from '../typings'

export function pack(cli: CAC) {
  const pkgPath = join(__dirname, '../package.json')

  if (fs.existsSync(pkgPath))
    cli.version(fs.readJSONSync(pkgPath).version)

  cli.help()
}

export const isNetworkUrl = (str: string) => {
  return /^(((ht|f)tps?):\/\/)?([^!@#$%^&*?.\s-]([^!@#$%^&*?.\s]{0,63}[^!@#$%^&*?.\s])?\.)+[a-z]{2,6}\/?/.test(str)
}

export function parseOptions(options: any): Partial<ApiPipeline.Config> {
  const config: any = {}
  if (options.pipe)
    config.pipeline = options.pipe
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

export function parseServers(config: ApiPipeline.DefineConfig): ApiPipeline.Config[] {
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
