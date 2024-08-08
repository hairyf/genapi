import { defineConfig } from '@genapi/config'

const config = defineConfig({
  pipeline: 'swag-fetch-js',
  input: 'https://petstore.swagger.io/v2/swagger.json',
  output: 'dist/index.ts',
})

export default config
