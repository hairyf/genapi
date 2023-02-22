import isArray from 'lodash/isArray'
import isObject from 'lodash/isObject'
import isUndefined from 'lodash/isUndefined'
import { loadConfig } from 'unconfig'
import { defaultConfig, openAPIWebClientGenerator } from '../'

export const actionApiGenerator = async () => {
  const { config = {} } = await loadConfig<any>({
    sources: {
      files: 'api-generator.config',
    },
  })
  if (!isArray(config.servers) && isObject(config.servers))
    config.servers = [config.servers]

  if (isUndefined(config.servers))
    config.servers = []

  const servers = config.servers
  delete config.servers

  Object.assign(defaultConfig, config)
  if (config.input)
    servers.push(config)
  await openAPIWebClientGenerator(servers)
}
