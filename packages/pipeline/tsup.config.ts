import { defineConfig } from 'tsup'
import { dependencies, name } from './package.json'

export default defineConfig((_options) => {
  return {
    external: Object.keys(dependencies || {}),
    outExtension: () => ({ js: '.mjs' }),
    entry: ['src/index.ts'],
    format: ['esm'],
    clean: true,
    dts: true,
    name,
  }
})
