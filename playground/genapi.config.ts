import { defineConfig } from '@genapi/core'
// create an API pipeline generator using the pipeline provided by genapi
// each pipeline exposes corresponding methods, which can be reused and reorganized
import pipeline from '@genapi/pipeline'
import presets from '@genapi/presets'

const config = defineConfig({
  input: 'https://petstore.swagger.io/v2/swagger.json',
  pipeline: pipeline(
    // read config, convert to internal config, and provide default values
    config => presets.axios.ts.config(config),
    // get data source
    configRead => pipeline.original(configRead),
    // parse the data source as data graphs
    configRead => presets.axios.ts.parser(configRead),
    // compile data and convert it into abstract syntax tree (AST)
    configRead => pipeline.compiler(configRead),
    // generate code string
    configRead => pipeline.generate(configRead),
    // use outputs to output files
    configRead => pipeline.dest(configRead),
  ),
  import: {
    http: './index.http',
  },
  output: {
    main: 'dist/index.ts',
    type: 'dist/index.type.ts',
  },
})

export default config
