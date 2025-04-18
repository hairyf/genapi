import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts'],
  fixedExtension: true,
  format: ['esm'],
  clean: true,
  dts: true,
})
