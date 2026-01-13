import assert from 'assert'
import {
  multiplyDense,
  multiplyDenseSIMD,
  multiplyVector,
  transpose,
  add,
  subtract,
  scalarMultiply,
  dotProduct
} from '../../../../src/wasm/matrix/multiply.ts'

describe('wasm/matrix/multiply', function () {
  const EPSILON = 1e-10

  describe('multiplyDense', function () {
    it('should multiply 2x2 matrices', function () {
      // A = [[1, 2], [3, 4]]
      // B = [[5, 6], [7, 8]]
      // A * B = [[19, 22], [43, 50]]
      const a = new Float64Array([1, 2, 3, 4])
      const b = new Float64Array([5, 6, 7, 8])
      const result = multiplyDense(a, 2, 2, b, 2, 2)

      assert.strictEqual(result[0], 19)
      assert.strictEqual(result[1], 22)
      assert.strictEqual(result[2], 43)
      assert.strictEqual(result[3], 50)
    })

    it('should multiply 2x3 and 3x2 matrices', function () {
      // A = [[1, 2, 3], [4, 5, 6]] (2x3)
      // B = [[7, 8], [9, 10], [11, 12]] (3x2)
      // A * B = [[58, 64], [139, 154]] (2x2)
      const a = new Float64Array([1, 2, 3, 4, 5, 6])
      const b = new Float64Array([7, 8, 9, 10, 11, 12])
      const result = multiplyDense(a, 2, 3, b, 3, 2)

      assert.strictEqual(result[0], 58)
      assert.strictEqual(result[1], 64)
      assert.strictEqual(result[2], 139)
      assert.strictEqual(result[3], 154)
    })

    it('should multiply identity matrix', function () {
      // I * A = A
      const identity = new Float64Array([1, 0, 0, 1])
      const a = new Float64Array([5, 6, 7, 8])
      const result = multiplyDense(identity, 2, 2, a, 2, 2)

      assert.strictEqual(result[0], 5)
      assert.strictEqual(result[1], 6)
      assert.strictEqual(result[2], 7)
      assert.strictEqual(result[3], 8)
    })

    it('should handle 1x1 matrices', function () {
      const a = new Float64Array([3])
      const b = new Float64Array([4])
      const result = multiplyDense(a, 1, 1, b, 1, 1)

      assert.strictEqual(result[0], 12)
    })
  })

  describe('multiplyDenseSIMD', function () {
    it('should produce same results as multiplyDense', function () {
      const a = new Float64Array([1, 2, 3, 4])
      const b = new Float64Array([5, 6, 7, 8])

      const result1 = multiplyDense(a, 2, 2, b, 2, 2)
      const result2 = multiplyDenseSIMD(a, 2, 2, b, 2, 2)

      for (let i = 0; i < result1.length; i++) {
        assert(Math.abs(result1[i] - result2[i]) < EPSILON)
      }
    })
  })

  describe('multiplyVector', function () {
    it('should multiply matrix by vector', function () {
      // A = [[1, 2], [3, 4]]
      // x = [5, 6]
      // A * x = [17, 39]
      const a = new Float64Array([1, 2, 3, 4])
      const x = new Float64Array([5, 6])
      const result = multiplyVector(a, 2, 2, x)

      assert.strictEqual(result[0], 17)
      assert.strictEqual(result[1], 39)
    })

    it('should handle identity matrix', function () {
      const identity = new Float64Array([1, 0, 0, 1])
      const x = new Float64Array([3, 4])
      const result = multiplyVector(identity, 2, 2, x)

      assert.strictEqual(result[0], 3)
      assert.strictEqual(result[1], 4)
    })

    it('should handle 3x3 matrix', function () {
      // A = [[1, 0, 0], [0, 1, 0], [0, 0, 1]]
      // x = [1, 2, 3]
      const identity = new Float64Array([1, 0, 0, 0, 1, 0, 0, 0, 1])
      const x = new Float64Array([1, 2, 3])
      const result = multiplyVector(identity, 3, 3, x)

      assert.strictEqual(result[0], 1)
      assert.strictEqual(result[1], 2)
      assert.strictEqual(result[2], 3)
    })
  })

  describe('transpose', function () {
    it('should transpose 2x2 matrix', function () {
      // A = [[1, 2], [3, 4]]
      // A^T = [[1, 3], [2, 4]]
      const a = new Float64Array([1, 2, 3, 4])
      const result = transpose(a, 2, 2)

      assert.strictEqual(result[0], 1)
      assert.strictEqual(result[1], 3)
      assert.strictEqual(result[2], 2)
      assert.strictEqual(result[3], 4)
    })

    it('should transpose 2x3 matrix to 3x2', function () {
      // A = [[1, 2, 3], [4, 5, 6]] (2x3)
      // A^T = [[1, 4], [2, 5], [3, 6]] (3x2)
      const a = new Float64Array([1, 2, 3, 4, 5, 6])
      const result = transpose(a, 2, 3)

      assert.strictEqual(result[0], 1)
      assert.strictEqual(result[1], 4)
      assert.strictEqual(result[2], 2)
      assert.strictEqual(result[3], 5)
      assert.strictEqual(result[4], 3)
      assert.strictEqual(result[5], 6)
    })

    it('should be self-inverse for square matrices', function () {
      const a = new Float64Array([1, 2, 3, 4])
      const transposed = transpose(a, 2, 2)
      const result = transpose(transposed, 2, 2)

      for (let i = 0; i < a.length; i++) {
        assert.strictEqual(result[i], a[i])
      }
    })
  })

  describe('add', function () {
    it('should add two arrays element-wise', function () {
      const a = new Float64Array([1, 2, 3, 4])
      const b = new Float64Array([5, 6, 7, 8])
      const result = add(a, b, 4)

      assert.strictEqual(result[0], 6)
      assert.strictEqual(result[1], 8)
      assert.strictEqual(result[2], 10)
      assert.strictEqual(result[3], 12)
    })

    it('should handle zeros', function () {
      const a = new Float64Array([1, 2, 3])
      const b = new Float64Array([0, 0, 0])
      const result = add(a, b, 3)

      assert.strictEqual(result[0], 1)
      assert.strictEqual(result[1], 2)
      assert.strictEqual(result[2], 3)
    })
  })

  describe('subtract', function () {
    it('should subtract two arrays element-wise', function () {
      const a = new Float64Array([5, 6, 7, 8])
      const b = new Float64Array([1, 2, 3, 4])
      const result = subtract(a, b, 4)

      assert.strictEqual(result[0], 4)
      assert.strictEqual(result[1], 4)
      assert.strictEqual(result[2], 4)
      assert.strictEqual(result[3], 4)
    })

    it('should handle negative results', function () {
      const a = new Float64Array([1, 2, 3])
      const b = new Float64Array([4, 5, 6])
      const result = subtract(a, b, 3)

      assert.strictEqual(result[0], -3)
      assert.strictEqual(result[1], -3)
      assert.strictEqual(result[2], -3)
    })
  })

  describe('scalarMultiply', function () {
    it('should multiply array by scalar', function () {
      const a = new Float64Array([1, 2, 3, 4])
      const result = scalarMultiply(a, 2, 4)

      assert.strictEqual(result[0], 2)
      assert.strictEqual(result[1], 4)
      assert.strictEqual(result[2], 6)
      assert.strictEqual(result[3], 8)
    })

    it('should handle zero scalar', function () {
      const a = new Float64Array([1, 2, 3])
      const result = scalarMultiply(a, 0, 3)

      assert.strictEqual(result[0], 0)
      assert.strictEqual(result[1], 0)
      assert.strictEqual(result[2], 0)
    })

    it('should handle negative scalar', function () {
      const a = new Float64Array([1, 2, 3])
      const result = scalarMultiply(a, -1, 3)

      assert.strictEqual(result[0], -1)
      assert.strictEqual(result[1], -2)
      assert.strictEqual(result[2], -3)
    })
  })

  describe('dotProduct', function () {
    it('should calculate dot product', function () {
      const a = new Float64Array([1, 2, 3])
      const b = new Float64Array([4, 5, 6])
      const result = dotProduct(a, b, 3)

      // 1*4 + 2*5 + 3*6 = 4 + 10 + 18 = 32
      assert.strictEqual(result, 32)
    })

    it('should return 0 for orthogonal vectors', function () {
      const a = new Float64Array([1, 0])
      const b = new Float64Array([0, 1])
      const result = dotProduct(a, b, 2)

      assert.strictEqual(result, 0)
    })

    it('should calculate magnitude squared when dotting with itself', function () {
      const a = new Float64Array([3, 4])
      const result = dotProduct(a, a, 2)

      // 3^2 + 4^2 = 25
      assert.strictEqual(result, 25)
    })
  })
})
