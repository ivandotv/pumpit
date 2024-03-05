import { vi } from 'vitest'
if (process.env.VITEST_DEBUG) {
  //increase vite default timeout when debugging via test files
  vi.setConfig({ testTimeout: 1_000 * 60 * 10 })
}
