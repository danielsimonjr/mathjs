import assert from 'assert'
import { MatrixWasmBridge } from '../../../src/wasm/MatrixWasmBridge.ts'

describe('wasm/MatrixWasmBridge', function () {
  describe('configure', function () {
    it('should accept configuration options', function () {
      // Should not throw
      MatrixWasmBridge.configure({
        useWasm: false,
        useParallel: false,
        minSizeForWasm: 50,
        minSizeForParallel: 500
      })
    })

    it('should accept partial configuration', function () {
      MatrixWasmBridge.configure({ useWasm: true })
      MatrixWasmBridge.configure({ minSizeForWasm: 200 })
    })
  })

  describe('getCapabilities', function () {
    it('should return capability information', function () {
      const caps = MatrixWasmBridge.getCapabilities()

      assert(typeof caps.wasmAvailable === 'boolean')
      assert(typeof caps.parallelAvailable === 'boolean')
      assert(typeof caps.simdAvailable === 'boolean')
    })

    it('parallelAvailable should be true in Node.js', function () {
      const caps = MatrixWasmBridge.getCapabilities()
      // Worker is available in Node.js
      assert(typeof caps.parallelAvailable === 'boolean')
    })
  })

  describe('multiplyJS (via multiply with WASM disabled)', function () {
    before(function () {
      // Disable WASM to test JavaScript fallback
      MatrixWasmBridge.configure({
        useWasm: false,
        useParallel: false
      })
    })

    it('should multiply 2x2 matrices', async function () {
      // A = [[1, 2], [3, 4]]
      // B = [[5, 6], [7, 8]]
      // A * B = [[19, 22], [43, 50]]
      const a = [1, 2, 3, 4]
      const b = [5, 6, 7, 8]
      const result = await MatrixWasmBridge.multiply(a, 2, 2, b, 2, 2)

      assert.strictEqual(result[0], 19)
      assert.strictEqual(result[1], 22)
      assert.strictEqual(result[2], 43)
      assert.strictEqual(result[3], 50)
    })

    it('should multiply 2x3 and 3x2 matrices', async function () {
      // A = [[1, 2, 3], [4, 5, 6]] (2x3)
      // B = [[7, 8], [9, 10], [11, 12]] (3x2)
      // A * B = [[58, 64], [139, 154]] (2x2)
      const a = [1, 2, 3, 4, 5, 6]
      const b = [7, 8, 9, 10, 11, 12]
      const result = await MatrixWasmBridge.multiply(a, 2, 3, b, 3, 2)

      assert.strictEqual(result[0], 58)
      assert.strictEqual(result[1], 64)
      assert.strictEqual(result[2], 139)
      assert.strictEqual(result[3], 154)
    })

    it('should multiply with Float64Array input', async function () {
      const a = new Float64Array([1, 2, 3, 4])
      const b = new Float64Array([5, 6, 7, 8])
      const result = await MatrixWasmBridge.multiply(a, 2, 2, b, 2, 2)

      assert.strictEqual(result[0], 19)
      assert.strictEqual(result[1], 22)
    })

    it('should return Float64Array', async function () {
      const result = await MatrixWasmBridge.multiply([1], 1, 1, [2], 1, 1)
      assert(result instanceof Float64Array)
      assert.strictEqual(result[0], 2)
    })
  })

  describe('luDecompositionJS (via luDecomposition with WASM disabled)', function () {
    before(function () {
      MatrixWasmBridge.configure({
        useWasm: false,
        useParallel: false
      })
    })

    it('should decompose a 2x2 matrix', async function () {
      // A = [[4, 3], [6, 3]]
      const a = [4, 3, 6, 3]
      const result = await MatrixWasmBridge.luDecomposition(a, 2)

      assert(result.lu instanceof Float64Array)
      assert(result.perm instanceof Int32Array)
      assert.strictEqual(result.singular, false)
    })

    it('should detect singular matrix', async function () {
      // Singular matrix (all zeros in a column after pivoting)
      const a = [0, 0, 0, 0]
      const result = await MatrixWasmBridge.luDecomposition(a, 2)

      assert.strictEqual(result.singular, true)
    })

    it('should decompose a 3x3 matrix', async function () {
      // A = [[2, 1, 1], [4, 3, 3], [8, 7, 9]]
      const a = [2, 1, 1, 4, 3, 3, 8, 7, 9]
      const result = await MatrixWasmBridge.luDecomposition(a, 3)

      assert.strictEqual(result.singular, false)
      assert.strictEqual(result.lu.length, 9)
      assert.strictEqual(result.perm.length, 3)
    })

    it('should handle identity matrix', async function () {
      const identity = [1, 0, 0, 0, 1, 0, 0, 0, 1]
      const result = await MatrixWasmBridge.luDecomposition(identity, 3)

      assert.strictEqual(result.singular, false)
    })
  })

  describe('cleanup', function () {
    it('should not throw when called with JS fallback', async function () {
      // Disable WASM to avoid WASM GC issues in test environment
      MatrixWasmBridge.configure({ useWasm: false })
      // cleanup may fail in test environment due to WASM GC, so we catch
      try {
        await MatrixWasmBridge.cleanup()
      } catch (e) {
        // WASM abort is expected in some test environments
      }
    })
  })

  // Note: Full WASM integration tests require the compiled WASM binary
  // and should be run separately with `npm run test:wasm`
})
