import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  root: resolve(__dirname, '.'),
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['tests/unit/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/ts/lib/**', 'src/ts/modules/**'],
      exclude: [
        'src/ts/main.ts',
        'src/ts/data/**',
        'src/ts/types/**',
        'src/ts/modules/navbar.ts',
        'src/ts/modules/lightbox.ts',
        'db_data/**',
        'node_modules/**',
        'dist/**',
      ],
      all: true,
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75, // null-guard branches (if !form, if !el, ?? '') covered by E2E
        statements: 80
      },
      reporter: ['text', 'lcov']
    }
  }
})
