import { defineConfig } from 'apipgen'
import source from './example'

const config = defineConfig({
  input: {
    json: source as Record<string, any>,
  },
  output: {
    main: 'dist-test/index.ts',
  },
})

export default config
