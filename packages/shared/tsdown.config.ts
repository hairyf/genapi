import { defineConfig } from 'tsdown'

export default defineConfig({
  fixedExtension: true,
  entry: ['src/index.ts'],
  format: ['esm'],
  clean: true,
  dts: true,
})
