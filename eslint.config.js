// @ts-check
import antfu from '@antfu/eslint-config'

export default antfu(
  {
    type: 'app',
  },
  {
    rules: {
      'ts/no-namespace': 'off',
    },
  },
)
