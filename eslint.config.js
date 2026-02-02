// @ts-check
import antfu from '@antfu/eslint-config'

export default antfu(
  {
    type: 'lib',
    pnpm: true,
    ignores: ['packages/**/*.md'],
  },
  {
    rules: {
      'ts/explicit-function-return-type': 'off',
      'ts/no-namespace': 'off',
    },
  },
)
