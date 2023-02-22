import ora from 'ora'
import pPipe from 'p-pipe'
import type {
  OpenAPIBuildConfiguration,
  OpenAPIDefineConfig,
} from './helper'
import {
  JSONParser,
  dataSource,
  dest,
  generate,
  parserTsConfig,
  tsCompiler,
} from './helper'

export interface OpenAPIWebClientGeneratorType {
  (config: OpenAPIBuildConfiguration | OpenAPIBuildConfiguration[]): Promise<void>
}

export const openAPIWebClientGenerator: OpenAPIWebClientGeneratorType = async (config) => {
  const configs: OpenAPIBuildConfiguration[] = Array.isArray(config) ? config : [config]
  const spinner = ora('Generate OpenAPI File...\n').start()

  const process = configs.map(
    pPipe(
      // 外模式 - 配置转换
      config => parserTsConfig(config),
      // 外模式 - 数据原
      configRead => dataSource(configRead),
      // 外模式 - 转模式
      configRead => JSONParser(configRead),
      // 模式   - 转内模式
      configRead => tsCompiler(configRead),
      // 内模式 - 转视图
      configRead => generate(configRead),
      // 视图   - 输出文件
      configRead => dest(configRead),
    ),
  )
  await Promise.all(process)

  spinner.succeed()
  spinner.clear()
}

/**
 * 处理 define config ，使得使用扩展更加方便
 * 该 config 提供给 @hairy/cli 的 hairy api-generator 使用
 * @param config
 * @returns
 */
export const defineConfig = (config: OpenAPIDefineConfig) => config

export * from './config'
