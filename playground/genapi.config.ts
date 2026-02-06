import { defineConfig } from '@genapi/core'
import { axios } from '@genapi/presets'

export default defineConfig({
  preset: axios.ts,
  input: 'https://petstore3.swagger.io/api/v3/openapi.json',
  meta: {
    baseURL: false,
  },
  output: {
    main: 'src/api/index.ts',
    type: 'src/api/index.type.ts',
  },
})
