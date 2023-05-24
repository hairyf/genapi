import { defineConfig } from '@genapi/config'

const config = defineConfig({
  pipeline: 'swag-ofetch-ts',
  input: 'https://petstore.swagger.io/v2/swagger.json',
  output: 'dist/index.ts',
})

export default config
