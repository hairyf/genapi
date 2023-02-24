import { defineConfig } from 'apipgen'
import source from './example'

const config = defineConfig({
  pipeline: 'swag-js',
  input: {
    json: source as Record<string, any>,
  },
  output: {
    main: 'dist-test/index.js',
  },
})

export default config
