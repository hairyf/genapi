import fs from 'node:fs/promises'
import { defineConfig } from 'tsdown'

export default defineConfig({
  onSuccess: () => fs.rename('dist/index.js', 'dist/index.mjs'),
  entry: ['src/index.ts'],
  format: ['esm'],
  clean: true,
  dts: true,
})
