import { defineConfig } from 'apipgen'

const config = defineConfig({
  pipeline: 'swag-js-axios',
  input: {
    uri: 'https://petstore.swagger.io/v2/swagger.json',
  },
  output: {
    main: 'dist-test/index.js',
  },
})

export default config
