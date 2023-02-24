import { defineConfig } from 'apipgen'
import source from './example'

const config = defineConfig({
  pipeline: 'swag-ts',
  input: {
    json: source as Record<string, any>,
  },
  output: {
    main: 'dist-test/index.ts',
  },
})

export default config
