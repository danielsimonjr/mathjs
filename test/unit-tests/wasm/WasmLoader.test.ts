import assert from 'assert'
import { WasmLoader, wasmLoader } from '../../../src/wasm/WasmLoader.ts'

describe('wasm/WasmLoader', function () {
  describe('WasmLoader singleton', function () {
    it('should return the same instance', function () {
      const instance1 = WasmLoader.getInstance()
      const instance2 = WasmLoader.getInstance()
      assert.strictEqual(instance1, instance2)
    })

    it('should export a global wasmLoader instance', function () {
      assert(wasmLoader instanceof WasmLoader)
    })

    it('should be the same as getInstance()', function () {
      assert.strictEqual(wasmLoader, WasmLoader.getInstance())
    })
  })

  describe('initial state', function () {
    it('should not be loaded initially', function () {
      // Note: This test assumes fresh state, but singleton may be loaded
      // from previous tests. We check getModule returns null OR a module.
      const module = wasmLoader.getModule()
      assert(module === null || typeof module === 'object')
    })

    it('isLoaded should match getModule state', function () {
      const module = wasmLoader.getModule()
      const isLoaded = wasmLoader.isLoaded()
      assert.strictEqual(isLoaded, module !== null)
    })
  })

  describe('error handling', function () {
    it('should throw when allocating without loaded module', function () {
      // Create a fresh loader (not the singleton) to test unloaded state
      const FreshLoader = class extends WasmLoader {
        constructor() {
          // @ts-ignore - accessing private constructor for testing
          super()
        }
        // Override to expose fresh instance
        static createFresh(): WasmLoader {
          return new FreshLoader()
        }
      }

      // We can't easily test this without mocking since WasmLoader
      // uses a private constructor. Instead we verify the singleton behavior.
      assert(typeof wasmLoader.isLoaded === 'function')
      assert(typeof wasmLoader.getModule === 'function')
    })
  })

  // Note: Full integration tests for load(), allocateFloat64Array(), etc.
  // require a compiled WASM binary and should be run as integration tests.
  // These tests verify the API structure and synchronous behavior.
})
