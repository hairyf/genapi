import type { ApiPipeline } from '@genapi/shared'
import process from 'node:process'
import { merge } from '@hairy/utils'
import cac from 'cac'
import { loadConfig } from 'unconfig'
import { operatePipelineGenerator } from '../generator'
import { initCommand } from './init'
import * as parser from './parser'

const cli = cac('genapi')

cli
  .option('--preset <preset>', 'The compilation preset used supports npm package (add the prefix genapi -) | local path')
  .option('--input <source>', 'The incoming string resolves to a uri or json path.')
  .option('--outfile <path>', 'genapi output file options')

cli
  .command('init', '初始化 genapi 配置文件')
  .action(async () => {
    await initCommand()
    // initCommand 会自己退出进程
  })

parser.readpack(cli)

// 在解析之前检查是否是 init 命令
const rawArgs = process.argv.slice(2)
const isInitCommand = rawArgs[0] === 'init'

if (isInitCommand) {
  // 如果是 init 命令，只调用 parse 来触发 action，不执行 main
  // initCommand 会在 action 中执行并退出进程
  cli.parse()
}
else {
  // 只有在不是 init 命令时才执行 main 逻辑
  const parsed = cli.parse()
  main(parsed)
}

async function main(parsed: ReturnType<typeof cli.parse>) {
  const { options } = parsed

  if (options.help || options.version)
    return

  const { config } = await loadConfig<ApiPipeline.DefineConfig>({
    sources: {
      files: 'genapi.config',
      rewrite: config => merge(parser.options(options), config) as any,
    },
  })

  // 如果配置文件不存在或为空，提示用户
  if (!config) {
    console.error('错误: 未找到 genapi 配置文件')
    console.log('\n提示: 运行 "genapi init" 来创建配置文件\n')
    process.exit(1)
  }

  const servers = parser.servers(config)
  await operatePipelineGenerator(servers)
}
