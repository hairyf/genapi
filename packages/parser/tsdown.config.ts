import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts'],
  dts: true,
  inlineOnly: false,
  exports: {
    devExports: true,
    enabled: true,
  },
  publint: true,
})
