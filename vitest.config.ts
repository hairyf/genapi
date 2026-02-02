import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
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
