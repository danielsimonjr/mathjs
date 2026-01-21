// @ts-nocheck
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    // Include TypeScript test files from test/wasm
    include: ['test/wasm/unit-tests/**/*.test.ts'],
    // Exclude node_modules
    exclude: ['node_modules'],
    // Use globals for describe, it, expect (Mocha-style)
    globals: true,
    // Environment
    environment: 'node',
    // Timeout
    testTimeout: 60000,
    // Reporter
    reporter: 'dot',
  },
  resolve: {
    // Allow importing TypeScript files
    extensions: ['.ts', '.js', '.mjs'],
    alias: {
      // Resolve src imports
      '@': path.resolve(__dirname, './src'),
    },
  },
  esbuild: {
    // Handle TypeScript features like enums
    target: 'es2020',
    // Keep class names for proper identification
    keepNames: true,
  },
})
