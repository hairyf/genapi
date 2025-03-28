import { defineConfig } from 'tsup'
import { name } from './package.json'

export default defineConfig((_options) => {
  return {
    outExtension: () => ({ js: '.mjs' }),
    entry: ['src/index.ts'],
    format: ['esm'],
    clean: true,
    dts: true,
    name,
  }
})
