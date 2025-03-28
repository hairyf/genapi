import { defineConfig } from '@genapi/core'
// create an API pipeline generator using the pipeline provided by genapi
// each pipeline exposes corresponding methods, which can be reused and reorganized
// import pipeline from '@genapi/pipeline'
// import presets from '@genapi/presets'

const config = defineConfig({
  input: 'https://petstore.swagger.io/v2/swagger.json',
  pipeline: 'swag-axios-ts',
  import: {
    http: './index.http',
  },
  output: {
    main: 'dist/index.ts',
    type: 'dist/index.type.ts',
  },
})

export default config
