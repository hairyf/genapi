import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'root',
          include: ['test/**/*.test.ts'],
        },
      },
      'packages/*',
    ],
  },
})
