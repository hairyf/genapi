import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts'],
  dts: true,
  exports: {
    devExports: true,
    enabled: true,
  },
  publint: true,
})
