import { defineConfig } from '@genapi/config'

const config = defineConfig({
  pipeline: 'swag-axios-js',
  input: {
    uri: 'https://petstore.swagger.io/v2/swagger.json',
  },
  output: {
    main: 'dist-test/index.ts',
  },

})

export default config
