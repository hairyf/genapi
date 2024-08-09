import { defineConfig } from '@genapi/config'

const config = defineConfig({
  pipeline: 'swag-fetch-ts',
  input: 'http://127.0.0.1:50010/swagger/json',
  output: 'dist/index.ts',
})

export default config
