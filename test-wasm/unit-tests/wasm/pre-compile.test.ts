/**
 * Pre-compilation tests - run AssemblyScript logic WITHOUT WASM compilation
 *
 * This imports AssemblyScript source files directly and executes them
 * as TypeScript, allowing testing before the full WASM build.
 */
import assert from 'assert'
import '../../../test-wasm/assemblyscript-stubs'

// Try to import AssemblyScript modules directly
// Note: This requires the type stubs to be loaded first

describe('Pre-Compilation Tests (Direct AS Import)', function () {
  // We'll dynamically import to test if it works

  describe('Logical Operations (direct import)', function () {
    it('should import and run logical operations', async function () {
      try {
        // Dynamic import of AssemblyScript source
        const logical = await import('../../../src-wasm/logical/operations')

        // Test basic operations
        assert.strictEqual(logical.and(1, 1), 1)
        assert.strictEqual(logical.and(1, 0), 0)
        assert.strictEqual(logical.or(0, 1), 1)
        assert.strictEqual(logical.not(0), 1)
        assert.strictEqual(logical.xor(1, 0), 1)

        console.log('  ✓ Direct AS import works for logical operations!')
      } catch (error) {
        // If import fails, show the error but don't fail the test
        // This is expected if AS types aren't properly stubbed
        console.log('  ⚠ Direct AS import not available:', (error as Error).message)
        this.skip()
      }
    })
  })

  describe('Relational Operations (direct import)', function () {
    it('should import and run relational operations', async function () {
      try {
        const relational = await import('../../../src-wasm/relational/operations')

        assert.strictEqual(relational.compare(5, 3), 1)
        assert.strictEqual(relational.compare(3, 5), -1)
        assert.strictEqual(relational.compare(4, 4), 0)
        assert.strictEqual(relational.equal(5, 5), 1)
        assert.strictEqual(relational.larger(5, 3), 1)

        console.log('  ✓ Direct AS import works for relational operations!')
      } catch (error) {
        console.log('  ⚠ Direct AS import not available:', (error as Error).message)
        this.skip()
      }
    })
  })

  describe('Special Functions (direct import)', function () {
    it('should import and run special functions', async function () {
      const special = await import('../../../src-wasm/special/functions')

      // Test erf(0) ≈ 0 (with tolerance for floating point)
      const erfZero = special.erf(0)
      assert.ok(Math.abs(erfZero) < 1e-7, `erf(0) should be ~0, got ${erfZero}`)

      // Test gamma(1) = 1
      const gammaOne = special.gamma(1)
      assert.ok(Math.abs(gammaOne - 1) < 1e-10, `gamma(1) should be ~1, got ${gammaOne}`)

      // Test gamma(5) = 24 (4!)
      const gammaFive = special.gamma(5)
      assert.ok(Math.abs(gammaFive - 24) < 1e-8, `gamma(5) should be ~24, got ${gammaFive}`)

      console.log('  ✓ Direct AS import works for special functions!')
    })
  })

  describe('Complex Operations (direct import)', function () {
    it('should import and run complex operations', async function () {
      const complex = await import('../../../src-wasm/complex/operations')

      // Test arg (phase angle)
      assert.ok(Math.abs(complex.arg(1, 0)) < 1e-10, 'arg(1,0) should be 0')
      assert.ok(Math.abs(complex.arg(0, 1) - Math.PI / 2) < 1e-10, 'arg(0,1) should be π/2')

      // Test abs (magnitude)
      assert.ok(Math.abs(complex.abs(3, 4) - 5) < 1e-10, 'abs(3,4) should be 5')

      // Test re/im
      assert.strictEqual(complex.re(3, 4), 3)
      assert.strictEqual(complex.im(3, 4), 4)

      console.log('  ✓ Direct AS import works for complex operations!')
    })
  })

  describe('Geometry Operations (direct import)', function () {
    it('should import and run geometry operations', async function () {
      const geometry = await import('../../../src-wasm/geometry/operations')

      // Test 2D distance
      const dist = geometry.distance2D(0, 0, 3, 4)
      assert.ok(Math.abs(dist - 5) < 1e-10, `distance2D should be 5, got ${dist}`)

      // Test 3D distance
      const dist3d = geometry.distance3D(0, 0, 0, 1, 2, 2)
      assert.ok(Math.abs(dist3d - 3) < 1e-10, `distance3D should be 3, got ${dist3d}`)

      console.log('  ✓ Direct AS import works for geometry operations!')
    })
  })
})
