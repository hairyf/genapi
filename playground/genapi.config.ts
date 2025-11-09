import { defineConfig } from '@genapi/core'
// create an API pipeline generator using the pipeline provided by genapi
// each pipeline exposes corresponding methods, which can be reused and reorganized
// import pipeline from '@genapi/pipeline'
import { uni } from '@genapi/presets'
import json from './swagger.json'

const config = defineConfig({
  input: { json },
  pipeline: uni.ts,
  output: {
    main: 'dist/index.ts',
    type: 'dist/index.type.ts',
  },

  responseRequired: true,
})

export default config
