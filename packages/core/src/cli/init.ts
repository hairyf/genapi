import { existsSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import process from 'node:process'
import { cancel, confirm, intro, isCancel, outro, select } from '@clack/prompts'
import consola from 'consola'
import { addDependency, addDevDependency, detectPackageManager } from 'nypm'

const logger = consola.withTag('genapi:init')

const CONFIG = {
  presets: {
    axios: { deps: ['axios'], schema: false },
    fetch: { deps: [], schema: true },
    ky: { deps: ['ky'], schema: false },
    got: { deps: ['got'], schema: false },
    ofetch: { deps: ['ofetch'], schema: true },
    uni: { deps: ['@uni-helper/uni-network'], schema: false },
  } as Record<string, { deps: string[], schema: boolean }>,
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

  const preset = await mandate<keyof typeof CONFIG.presets>(select({
    message: 'Select preset:',
    options: Object.keys(CONFIG.presets).map(v => ({ value: v, label: v })),
  }))

  const mode = await mandate<('ts' | 'js' | 'schema')>(select({
    message: 'Select mode:',
    options: [
      { value: 'ts', label: 'TS' },
      { value: 'js', label: 'JS' },
      ...(CONFIG.presets[preset].schema ? [{ value: 'schema', label: 'Schema' }] : []),
    ],
  }))

  const isTS = mode !== 'js'
  const fileName = `genapi.config.${isTS ? 'ts' : 'js'}`
  const presetValue = `${preset}.${mode}`
  const content = isTS
    ? `import { defineConfig } from '@genapi/core'
import { ${preset} } from '@genapi/presets'

export default defineConfig({ preset: ${presetValue}, input: '...', output: { main: 'src/api/index.ts' } })`
    : `const { defineConfig } = require('@genapi/core')
const { ${preset} } = require('@genapi/presets')

module.exports = defineConfig({ preset: ${presetValue}, input: '...', output: { main: 'src/api/index.ts' } })`

  if (existsSync(join(process.cwd(), fileName)) && !await mandate(confirm({ message: 'Overwrite?' })))
    return

  writeFileSync(join(process.cwd(), fileName), content)

  // 3. 依赖闭环
  const deps = CONFIG.presets[preset].deps
  const devDeps = ['@genapi/core', '@genapi/presets', ...(mode === 'schema' ? ['fetchdts'] : [])]

  if (await mandate(confirm({ message: 'Install now?' }))) {
    addDependency(deps, { cwd: process.cwd() })
    addDevDependency(devDeps, { cwd: process.cwd() })
  }
  else {
    const pm = (await detectPackageManager(process.cwd()))?.name || 'npm'
    logger.info(`Manual: ${pm} add -D ${deps.join(' ')}`)
  }

  outro('✨ Success')
}
