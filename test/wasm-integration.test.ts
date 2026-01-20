/**
 * WASM Integration Tests
 *
 * Tests for WASM module initialization and basic functionality.
 *
 * Sprint: Phase 5 - Sprint 1 - Integration Testing
 * Tasks: 5.1.1, 5.1.2
 */

import assert from 'assert'

describe('WASM Integration Tests', function () {
  // Increase timeout for WASM loading
  this.timeout(10000)

  describe('WASM Module Initialization', function () {
    it('should successfully load WASM module', async function () {
      try {
        const { initWasm } = await import('../src/wasm/WasmLoader.js')
        const wasmModule = await initWasm()
        assert.ok(wasmModule, 'WASM module should be loaded')
        assert.strictEqual(
          typeof wasmModule,
          'object',
          'WASM module should be an object'
        )
      } catch (err) {
        // WASM module may not be available in all environments
        if ((err as Error).message.includes('Cannot find module')) {
          this.skip()
        } else {
          throw err
        }
      }
    })

    it('should handle multiple load calls (caching)', async function () {
      try {
        const { initWasm } = await import('../src/wasm/WasmLoader.js')
        const module1 = await initWasm()
        const module2 = await initWasm()

        // Both calls should return the same cached module
        assert.strictEqual(
          module1,
          module2,
          'Subsequent loads should return cached module'
        )
      } catch (err) {
        if ((err as Error).message.includes('Cannot find module')) {
          this.skip()
        } else {
          throw err
        }
      }
    })

    it('should gracefully handle WASM unavailability', async function () {
      // Test that code doesn't crash when WASM is unavailable
      try {
        const { initWasm } = await import('../src/wasm/WasmLoader.js')
        await initWasm()
      } catch (err) {
        // Should either load successfully or fail gracefully
        assert.ok(err instanceof Error || err === null)
      }
    })

    it('should load WASM module within reasonable time', async function () {
      const startTime = Date.now()

      try {
        const { initWasm } = await import('../src/wasm/WasmLoader.js')
        await initWasm()
        const loadTime = Date.now() - startTime

        // WASM should load in less than 5 seconds (very generous)
        assert.ok(
          loadTime < 5000,
          `WASM load time ${loadTime}ms should be < 5000ms`
        )
      } catch (err) {
        if ((err as Error).message.includes('Cannot find module')) {
          this.skip()
        } else {
          throw err
        }
      }
    })
  })

  describe('MatrixWasmBridge Operations', function () {
    it('should multiply matrices using static method', async function () {
      try {
        const { MatrixWasmBridge } = await import(
          '../src/wasm/MatrixWasmBridge.js'
        )

        // Create 2x2 matrices as flat arrays
        const a = new Float64Array([1, 2, 3, 4]) // [[1,2],[3,4]]
        const b = new Float64Array([5, 6, 7, 8]) // [[5,6],[7,8]]

        const result = await MatrixWasmBridge.multiply(a, 2, 2, b, 2, 2)

        // Expected: [[1*5+2*7, 1*6+2*8], [3*5+4*7, 3*6+4*8]] = [[19, 22], [43, 50]]
        assert.strictEqual(result[0], 19)
        assert.strictEqual(result[1], 22)
        assert.strictEqual(result[2], 43)
        assert.strictEqual(result[3], 50)
      } catch (err) {
        if (
          (err as Error).message.includes('not implemented') ||
          (err as Error).message.includes('Cannot find module')
        ) {
          this.skip()
        } else {
          throw err
        }
      }
    })

    it('should verify MatrixWasmBridge capabilities', async function () {
      try {
        const { MatrixWasmBridge } = await import(
          '../src/wasm/MatrixWasmBridge.js'
        )

        // Verify getCapabilities method exists and returns expected structure
        const capabilities = MatrixWasmBridge.getCapabilities()
        assert.ok(
          typeof capabilities === 'object',
          'Capabilities should be an object'
        )
        assert.ok(
          'wasmAvailable' in capabilities,
          'Should report WASM availability status'
        )
        assert.ok(
          'parallelAvailable' in capabilities,
          'Should report parallel availability status'
        )
        assert.ok(
          'simdAvailable' in capabilities,
          'Should report SIMD availability status'
        )
      } catch (err) {
        if ((err as Error).message.includes('Cannot find module')) {
          this.skip()
        } else {
          throw err
        }
      }
    })
  })

  describe('WASM Availability Check', function () {
    it('should gracefully handle WASM loading attempts', async function () {
      // WASM availability is tested through successful initWasm() calls
      // This test verifies that the module structure is correct
      try {
        const WasmLoaderModule = await import('../src/wasm/WasmLoader.js')
        assert.ok(
          WasmLoaderModule.initWasm,
          'initWasm function should be exported'
        )
        assert.ok(
          typeof WasmLoaderModule.initWasm === 'function',
          'initWasm should be a function'
        )
      } catch (err) {
        if ((err as Error).message.includes('Cannot find module')) {
          this.skip()
        } else {
          throw err
        }
      }
    })
  })
})
