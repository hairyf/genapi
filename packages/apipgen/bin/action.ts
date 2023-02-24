import isArray from 'lodash/isArray'
import isObject from 'lodash/isObject'
import isUndefined from 'lodash/isUndefined'
import { loadConfig } from 'unconfig'
import { openPipeWebClientGenerator } from '../'

export const actionApiGenerator = async () => {
  const { config = {} } = await loadConfig<any>({
    sources: {
      files: 'apipgen.config',
    },
  })
  if (!isArray(config.servers) && isObject(config.servers))
    config.servers = [config.servers]

  if (isUndefined(config.servers))
    config.servers = []

  const servers = config.servers
  delete config.servers

  if (config.input)
    servers.push(config)

  await openPipeWebClientGenerator(servers)
}
