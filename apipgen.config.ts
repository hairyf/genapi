import { defineConfig } from 'apipgen'

const config = defineConfig({
  pipeline: 'swag-ts-fetch',
  baseURL: 'import.env.url',
  input: {
    uri: 'https://petstore.swagger.io/v2/swagger.json',
  },
  output: {
    main: 'dist-test/index.ts',
  },
})

export default config
