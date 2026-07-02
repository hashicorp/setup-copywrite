/**
 * Copyright IBM Corp. 2023, 2026
 * SPDX-License-Identifier: MPL-2.0
 */

import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html']
    },
    testTimeout: 15000,
    environment: 'node'
  }
})
