/* eslint-disable @typescript-eslint/no-var-requires */
import type { AxiosRequestConfig } from 'axios'
import axios from 'axios'
import type { OpenAPIBuildConfigurationRead } from '../typings/generator'

interface DataSourceOptions {
  uri?: string
  json?: any
  test?: boolean
  config?: AxiosRequestConfig
}

const getSource = async (options: DataSourceOptions | string) => {
  if (typeof options === 'string') {
    const { data } = await axios(options, {
      method: 'get',
      responseType: 'json',
    })
    return data
  }
  if (options.test)
    return require('./internal/example').default
  if (options.json)
    return options.json
  if (options.uri) {
    const { data } = await axios(options.uri, {
      method: 'get',
      responseType: 'json',
      ...options.config,
    })
    return data
  }
  throw new Error('Not Select Chanel')
}

export async function dataSource(options: OpenAPIBuildConfigurationRead) {
  options.source = await getSource(options.config.input)
  return options
}
