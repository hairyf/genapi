// @ts-check
import antfu from '@antfu/eslint-config'

export default antfu(
  {
    type: 'lib',
    pnpm: true,
    ignores: ['packages/**/*.md', 'docs/**/*.md'],
  },
  {
    rules: {
      'no-template-curly-in-string': 'off',
      'ts/explicit-function-return-type': 'off',
      'ts/no-namespace': 'off',
      'pnpm/yaml-enforce-settings': 'off',
    },
  },
)
