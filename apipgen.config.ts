import { defineConfig } from 'apipgen'

const config = defineConfig({
  pipeline: 'swag-got-ts',
  input: {
    uri: 'https://petstore.swagger.io/v2/swagger.json',
  },
  output: {
    main: 'dist-test/index.ts',
  },

})

export default config
