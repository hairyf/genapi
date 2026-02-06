import { defineConfig } from '@genapi/core'
import { ofetch } from '@genapi/presets'

export default defineConfig({
  preset: ofetch.schema,
  parser: 'wpapi',
  input: 'http://example.com/api-docs',
  output: {
    main: 'src/api/index.ts',
    type: 'src/api/index.type.ts',
  },
})
