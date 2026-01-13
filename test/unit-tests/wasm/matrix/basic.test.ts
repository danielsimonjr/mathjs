import assert from 'assert'
import {
  zeros,
  ones,
  identity,
  fill,
  diagFromVector,
  eye
} from '../../../../src/wasm/matrix/basic.ts'

describe('wasm/matrix/basic', function () {
  describe('zeros', function () {
    it('should create zero matrix (uses i32)', function () {
      const result = zeros(2, 3)
      assert.strictEqual(result.length, 6)
      for (let i = 0; i < 6; i++) {
        assert.strictEqual(result[i], 0)
      }
    })

    it('should create 1x1 zero matrix', function () {
      const result = zeros(1, 1)
      assert.strictEqual(result.length, 1)
      assert.strictEqual(result[0], 0)
    })
  })

  describe('ones', function () {
    it('should create ones matrix (uses i32)', function () {
      const result = ones(2, 2)
      assert.strictEqual(result.length, 4)
      for (let i = 0; i < 4; i++) {
        assert.strictEqual(result[i], 1)
      }
    })

    it('should create rectangular ones matrix', function () {
      const result = ones(3, 2)
      assert.strictEqual(result.length, 6)
      for (let i = 0; i < 6; i++) {
        assert.strictEqual(result[i], 1)
      }
    })
  })

  describe('identity', function () {
    it('should create identity matrix (uses i32)', function () {
      const result = identity(3)
      // Row-major: [1,0,0, 0,1,0, 0,0,1]
      assert.strictEqual(result.length, 9)
      assert.strictEqual(result[0], 1)
      assert.strictEqual(result[1], 0)
      assert.strictEqual(result[2], 0)
      assert.strictEqual(result[3], 0)
      assert.strictEqual(result[4], 1)
      assert.strictEqual(result[5], 0)
      assert.strictEqual(result[6], 0)
      assert.strictEqual(result[7], 0)
      assert.strictEqual(result[8], 1)
    })

    it('should create 1x1 identity', function () {
      const result = identity(1)
      assert.strictEqual(result[0], 1)
    })

    it('should create 2x2 identity', function () {
      const result = identity(2)
      assert.deepStrictEqual(Array.from(result), [1, 0, 0, 1])
    })
  })

  describe('fill', function () {
    it('should fill matrix with value (uses i32, f64)', function () {
      const result = fill(2, 3, 5)
      assert.strictEqual(result.length, 6)
      for (let i = 0; i < 6; i++) {
        assert.strictEqual(result[i], 5)
      }
    })

    it('should handle negative values', function () {
      const result = fill(2, 2, -3.5)
      for (let i = 0; i < 4; i++) {
        assert.strictEqual(result[i], -3.5)
      }
    })
  })

  describe('diagFromVector', function () {
    it('should create diagonal matrix from vector (uses i32)', function () {
      const diag = new Float64Array([1, 2, 3])
      const result = diagFromVector(diag, 3)
      // Row-major: [1,0,0, 0,2,0, 0,0,3]
      assert.strictEqual(result[0], 1)
      assert.strictEqual(result[1], 0)
      assert.strictEqual(result[4], 2)
      assert.strictEqual(result[8], 3)
    })

    it('should handle single element', function () {
      const diag = new Float64Array([5])
      const result = diagFromVector(diag, 1)
      assert.strictEqual(result[0], 5)
    })
  })

  describe('eye', function () {
    it('should create matrix with ones on main diagonal (uses i32)', function () {
      const result = eye(3, 0)
      // Same as identity
      assert.strictEqual(result[0], 1)
      assert.strictEqual(result[4], 1)
      assert.strictEqual(result[8], 1)
    })

    it('should create matrix with ones on upper diagonal', function () {
      const result = eye(3, 1)
      // [0,1,0, 0,0,1, 0,0,0]
      assert.strictEqual(result[0], 0)
      assert.strictEqual(result[1], 1)
      assert.strictEqual(result[4], 0)
      assert.strictEqual(result[5], 1)
    })

    it('should create matrix with ones on lower diagonal', function () {
      const result = eye(3, -1)
      // [0,0,0, 1,0,0, 0,1,0]
      assert.strictEqual(result[3], 1)
      assert.strictEqual(result[7], 1)
    })
  })

  describe('matrix creation properties', function () {
    it('identity should have trace = n', function () {
      const n = 4
      const I = identity(n)
      let trace = 0
      for (let i = 0; i < n; i++) {
        trace += I[i * n + i]
      }
      assert.strictEqual(trace, n)
    })

    it('zeros should have all elements 0', function () {
      const m = zeros(5, 5)
      const sum = m.reduce((a, b) => a + b, 0)
      assert.strictEqual(sum, 0)
    })

    it('ones should have sum = rows * cols', function () {
      const rows = 3, cols = 4
      const m = ones(rows, cols)
      const sum = m.reduce((a, b) => a + b, 0)
      assert.strictEqual(sum, rows * cols)
    })
  })
})
