// @ts-nocheck
import { defineConfig } from 'vitest/config'
import path from 'path'
import fs from 'fs'

// Check if WASM module is built
const wasmPath = path.resolve(__dirname, './lib/wasm/index.js')
const wasmBuilt = fs.existsSync(wasmPath)

export default defineConfig({
  test: {
    // Include TypeScript test files from test/wasm
    include: ['test/wasm/unit-tests/**/*.test.ts'],
    // Exclude node_modules and direct-wasm tests if WASM not built
    exclude: wasmBuilt
      ? ['node_modules']
      : ['node_modules', 'test/wasm/unit-tests/wasm/direct-wasm.test.ts'],
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
      // Resolve WASM module imports - use source files for pre-compile testing
      // This allows tests to run even when WASM isn't compiled
      // For compiled WASM tests, use the actual lib/wasm path
    },
  },
  esbuild: {
    // Handle TypeScript features like enums
    target: 'es2020',
    // Keep class names for proper identification
    keepNames: true,
  },
})
