import { defineConfig } from '@genapi/core'
import { tanstackQuery } from '@genapi/presets'

export default defineConfig({
  preset: tanstackQuery.react,
  input: 'https://petstore3.swagger.io/api/v3/openapi.json',
  output: {
    main: 'dist/index.ts',
    type: 'dist/index.type.ts',
  },
})
