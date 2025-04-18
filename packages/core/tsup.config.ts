import { esbuildPluginFilePathExtensions } from 'esbuild-plugin-file-path-extensions'
import { defineConfig } from 'tsup'
import { dependencies } from './package.json'

export default defineConfig({
  esbuildPlugins: [esbuildPluginFilePathExtensions()],
  outExtension: () => ({ js: '.mjs' }),
  external: Object.keys(dependencies || {}),
  entry: ['src/**/*.ts'],
  format: ['esm'],
  bundle: true,
  clean: true,
  dts: true,
})
