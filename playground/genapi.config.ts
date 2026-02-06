import { defineConfig } from '@genapi/core'
// create an API pipeline generator using the pipeline provided by genapi
// each pipeline exposes corresponding methods, which can be reused and reorganized
// import pipeline from '@genapi/pipeline'
import { ofetch } from '@genapi/presets'

const config = defineConfig({
  preset: ofetch.schema,

  input: 'https://petstore.swagger.io/v2/swagger.json',
  output: {
    main: 'dist/index.ts',
    type: 'dist/index.type.ts',
  },

})

export default config
