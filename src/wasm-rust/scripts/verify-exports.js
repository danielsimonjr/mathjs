#!/usr/bin/env node
/**
 * Verify that the Rust WASM binary exports all functions expected by WasmLoader.ts.
 * Run after building: node src/wasm-rust/scripts/verify-exports.js
 */
const fs = require('fs')
const path = require('path')

const WASM_PATH = path.join(__dirname, '..', '..', '..', 'lib', 'wasm', 'mathjs.wasm')
const LOADER_PATH = path.join(__dirname, '..', '..', 'wasm', 'WasmLoader.ts')

async function main() {
  // 1. Extract expected exports from WasmModule interface
  const loaderSource = fs.readFileSync(LOADER_PATH, 'utf-8')
  const interfaceMatch = loaderSource.match(/export interface WasmModule \{([\s\S]*?)\n\}/)
  if (!interfaceMatch) {
    console.error('Could not find WasmModule interface in WasmLoader.ts')
    process.exit(1)
  }

  const interfaceBody = interfaceMatch[1]
  const expectedExports = []
  const fnPattern = /^\s+(\w+)\s*:/gm
  let match
  while ((match = fnPattern.exec(interfaceBody)) !== null) {
    const name = match[1]
    if (name !== 'memory') {
      expectedExports.push(name)
    }
  }

  console.log('Expected exports from WasmModule: ' + expectedExports.length)

  // 2. Load WASM binary and get actual exports
  if (!fs.existsSync(WASM_PATH)) {
    console.error('WASM binary not found: ' + WASM_PATH)
    console.error('Run "npm run build:wasm" first.')
    process.exit(1)
  }

  const wasmBuffer = fs.readFileSync(WASM_PATH)
  const wasmModule = await WebAssembly.compile(wasmBuffer)
  const instance = await WebAssembly.instantiate(wasmModule, {
    env: { abort: function() {} }
  })

  const actualExports = Object.keys(instance.exports)
  console.log('Actual exports from WASM binary: ' + actualExports.length)

  // 3. Check for missing exports
  const missing = expectedExports.filter(function(name) { return !actualExports.includes(name) })

  if (missing.length > 0) {
    console.error('\nMISSING exports (' + missing.length + '):')
    missing.forEach(function(name) { console.error('  - ' + name) })
  }

  // 4. Report
  const covered = expectedExports.length - missing.length
  const coverage = (covered / expectedExports.length * 100).toFixed(1)
  console.log('\nExport coverage: ' + coverage + '% (' + covered + '/' + expectedExports.length + ')')

  if (missing.length > 0) {
    console.error('\nFAILED: Missing exports detected.')
    process.exit(1)
  } else {
    console.log('\nPASSED: All expected exports present.')
  }
}

main().catch(function(err) {
  console.error(err)
  process.exit(1)
})
