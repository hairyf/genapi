import { defineConfig } from './src'

const config = defineConfig({
  input: {
    test: true,
  },
  output: {
    main: 'dist-test/index.ts',
    type: 'dist-test/types.ts',
  },
})

export default config
