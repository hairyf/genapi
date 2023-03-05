import { defineConfig } from 'apipgen'

const config = defineConfig({
  pipeline: 'swag-ky-js',
  input: {
    uri: 'https://petstore.swagger.io/v2/swagger.json',
  },
  baseURL: 'aedwa',
  output: {
    main: 'dist-test/index.ts',
  },

})

export default config
