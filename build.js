import { build } from 'esbuild'

// Build as CommonJS for GitHub Actions
// Using .cjs extension so Node treats it as CommonJS regardless of package.json "type"
await build({
  entryPoints: ['index.js'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'cjs',
  outfile: 'dist/index.cjs',
  sourcemap: true,
  banner: {
    js: '// Copyright IBM Corp. 2023, 2025\n// SPDX-License-Identifier: MPL-2.0\n'
  }
})

console.log('✓ Bundle created successfully: dist/index.cjs')
