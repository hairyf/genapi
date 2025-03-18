import { defineConfig } from '@genapi/config'

const config = defineConfig({
  pipeline: 'swag-fetch-ts',
  input: 'http://localhost:4000/swagger/json',
  output: 'dist/index.ts',
})

export default config
