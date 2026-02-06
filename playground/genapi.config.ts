import { defineConfig } from '@genapi/core'
import { tanstackQuery } from '@genapi/presets'

export default defineConfig({
  preset: tanstackQuery.react,
  input: 'https://petstore3.swagger.io/api/v3/openapi.json',
  output: {
    main: 'src/api/index.ts',
    type: 'src/api/index.type.ts',
  },
})
