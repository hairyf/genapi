import { defineConfig } from '@genapi/core'
import { tanstackQuery } from '@genapi/presets'

export default defineConfig({
  preset: tanstackQuery.react,
  input: '...',
  output: {
    main: 'src/api/index.ts',
    type: 'src/api/index.type.ts',
  },
})
