import { esbuildPluginFilePathExtensions } from 'esbuild-plugin-file-path-extensions'
import { defineConfig } from 'tsup'
import { dependencies, name } from './package.json'

export default defineConfig((_options) => {
  return {
    esbuildPlugins: [esbuildPluginFilePathExtensions()],
    outExtension: () => ({ js: '.mjs' }),
    entry: ['src/**/*.ts'],
    format: ['esm'],
    clean: true,
    dts: true,
    name,
    bundle: true,
    // minify: !options.watch,
    external: Object.keys(dependencies || {}),
  }
})
