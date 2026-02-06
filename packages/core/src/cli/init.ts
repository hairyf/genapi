import { existsSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import process from 'node:process'
import { cancel, confirm, intro, isCancel, outro, select } from '@clack/prompts'
import { addDevDependency } from 'nypm'

// 定义可选特性，避免大量的 boolean 开关
type Feature = 'js' | 'schema' | 'ts'

interface PresetConfig {
  label: string
  pkg: string
  fixedMode?: string // 如果有值，则跳过用户选择模式环节（如 react/vue）
  features: Feature[] // 支持的特性列表
}

const PRESETS: Record<string, PresetConfig> = {
  // 基础 HTTP 库：通常支持 TS/JS，部分支持 Schema
  'fetch': { label: 'fetch', pkg: 'fetch', features: ['ts', 'js', 'schema'] },
  'ofetch': { label: 'ofetch', pkg: 'ofetch', features: ['ts', 'js', 'schema'] },
  'axios': { label: 'axios', pkg: 'axios', features: ['ts', 'js'] },
  'ky': { label: 'ky', pkg: 'ky', features: ['ts', 'js'] },
  'got': { label: 'got', pkg: 'got', features: ['ts', 'js'] },

  // 框架集成：通常有固定模式，且仅支持 TS
  'react-query': { label: '@tanstack/react-query', pkg: 'tanstackQuery', fixedMode: 'react', features: ['ts'] },
  'vue-query': { label: '@tanstack/vue-query', pkg: 'tanstackQuery', fixedMode: 'vue', features: ['ts'] },
  'colada': { label: '@pinia/colada', pkg: 'colada', features: ['ts'] },
  'uni-network': { label: '@uni-helper/uni-network', pkg: 'uni', features: ['ts', 'js'] },
}

async function mandate<T>(promise: Promise<any>): Promise<T> {
  const res = await promise
  if (isCancel(res)) {
    cancel('Operation cancelled')
    process.exit(0)
  }
  return res as T
}

export async function initCommand() {
  intro('🚀 genapi init')

  // 1. 选择预设
  const selectedKey = await mandate<keyof typeof PRESETS>(select({
    message: 'Select a preset:',
    options: Object.entries(PRESETS).map(([value, { label }]) => ({ value, label })),
  }))

  const preset = PRESETS[selectedKey]

  // 2. 确定运行模式
  const mode = preset.fixedMode || await mandate<string>(select({
    message: 'Select output mode:',
    options: [
      { value: 'ts', label: 'TypeScript' },
      ...(preset.features.includes('js') ? [{ value: 'js', label: 'JavaScript' }] : []),
      ...(preset.features.includes('schema') ? [{ value: 'schema', label: 'Schema' }] : []),
    ],
  }))

  // 3. 构造配置文件内容
  const fileName = 'genapi.config.ts'
  // 只有 js 模式使用 .js 后缀，其余（ts, schema, react, vue）均使用 .ts
  const extension = mode === 'js' ? 'js' : 'ts'

  const content = `import { defineConfig } from '@genapi/core'
import { ${preset.pkg} } from '@genapi/presets'

export default defineConfig({
  preset: ${preset.pkg}.${mode},
  input: 'https://petstore3.swagger.io/api/v3/openapi.json',
  output: {
    main: 'src/api/index.${extension}',
    ${mode !== 'js' ? 'type: \'src/api/index.type.ts\',' : ''}
  }
})`

  // 4. 冲突检查
  if (existsSync(join(process.cwd(), fileName))) {
    if (!await mandate(confirm({ message: `${fileName} already exists. Overwrite?`, initialValue: false }))) {
      outro('Operation aborted')
      return
    }
  }

  // 5. 写入与安装
  writeFileSync(join(process.cwd(), fileName), content)

  const devDeps = ['@genapi/core', '@genapi/presets']
  if (mode === 'schema')
    devDeps.push('fetchdts')

  await addDevDependency(devDeps, { cwd: process.cwd() })

  outro('✨ Configuration initialized successfully!')
}
