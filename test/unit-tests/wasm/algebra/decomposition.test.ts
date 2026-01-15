import assert from 'assert'
import {
  luDecomposition,
  getLUMatrix,
  getLUPerm,
  isLUSingular,
  qrDecomposition,
  getQMatrix,
  getRMatrix,
  choleskyDecomposition,
  getCholeskyL,
  isCholeskySuccess,
  luSolve,
  luDeterminant
} from '../../../../src/wasm/algebra/decomposition.ts'

const EPSILON = 1e-10

function approxEqual(a: number, b: number, eps: number = EPSILON): boolean {
  return Math.abs(a - b) < eps
}

// Matrix multiplication helper: C = A * B
function matMul(
  A: Float64Array,
  B: Float64Array,
  m: number,
  k: number,
  n: number
): Float64Array {
  const C = new Float64Array(m * n)
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      let sum = 0
      for (let p = 0; p < k; p++) {
        sum += A[i * k + p] * B[p * n + j]
      }
      C[i * n + j] = sum
    }
  }
  return C
}

// Transpose helper
function transpose(A: Float64Array, m: number, n: number): Float64Array {
  const AT = new Float64Array(n * m)
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      AT[j * m + i] = A[i * n + j]
    }
  }
  return AT
}

describe('wasm/algebra/decomposition', function () {
  describe('luDecomposition', function () {
    it('should decompose 2x2 matrix', function () {
      // A = [[4, 3], [6, 3]]
      const A = new Float64Array([4, 3, 6, 3])
      const result = luDecomposition(A, 2)

      assert.strictEqual(isLUSingular(result), false)

      const lu = getLUMatrix(result)
      const perm = getLUPerm(result)

      assert(lu instanceof Float64Array)
      assert.strictEqual(lu.length, 4)
      assert(perm instanceof Int32Array)
      assert.strictEqual(perm.length, 2)
    })

    it('should detect singular matrix', function () {
      // Singular: [[0, 0], [0, 0]]
      const A = new Float64Array([0, 0, 0, 0])
      const result = luDecomposition(A, 2)

      assert.strictEqual(isLUSingular(result), true)
    })

    it('should decompose 3x3 matrix', function () {
      // A = [[2, 1, 1], [4, 3, 3], [8, 7, 9]]
      const A = new Float64Array([2, 1, 1, 4, 3, 3, 8, 7, 9])
      const result = luDecomposition(A, 3)

      assert.strictEqual(isLUSingular(result), false)
      assert.strictEqual(getLUMatrix(result).length, 9)
      assert.strictEqual(getLUPerm(result).length, 3)
    })

    it('should handle identity matrix', function () {
      const I = new Float64Array([1, 0, 0, 0, 1, 0, 0, 0, 1])
      const result = luDecomposition(I, 3)

      assert.strictEqual(isLUSingular(result), false)
    })
  })

  describe('qrDecomposition', function () {
    it('should decompose 2x2 matrix', function () {
      // A = [[1, 2], [3, 4]]
      const A = new Float64Array([1, 2, 3, 4])
      const result = qrDecomposition(A, 2, 2)

      const Q = getQMatrix(result)
      const R = getRMatrix(result)

      assert.strictEqual(Q.length, 4)
      assert.strictEqual(R.length, 4)

      // Verify Q is orthogonal: Q * Q^T = I
      const QT = transpose(Q, 2, 2)
      const QQT = matMul(Q, QT, 2, 2, 2)
      assert(approxEqual(QQT[0], 1, 1e-6))
      assert(approxEqual(QQT[1], 0, 1e-6))
      assert(approxEqual(QQT[2], 0, 1e-6))
      assert(approxEqual(QQT[3], 1, 1e-6))
    })

    it('should decompose tall matrix (3x2)', function () {
      // A = [[1, 2], [3, 4], [5, 6]]
      const A = new Float64Array([1, 2, 3, 4, 5, 6])
      const result = qrDecomposition(A, 3, 2)

      const Q = getQMatrix(result)
      const R = getRMatrix(result)

      assert.strictEqual(Q.length, 9) // 3x3
      assert.strictEqual(R.length, 6) // 3x2
    })

    it('should produce upper triangular R', function () {
      const A = new Float64Array([1, 2, 3, 4])
      const result = qrDecomposition(A, 2, 2)
      const R = getRMatrix(result)

      // R[1,0] should be approximately 0
      assert(approxEqual(R[2], 0, 1e-6))
    })

    it('should satisfy A = Q * R', function () {
      const A = new Float64Array([1, 2, 3, 4])
      const result = qrDecomposition(A, 2, 2)
      const Q = getQMatrix(result)
      const R = getRMatrix(result)

      // Q is 2x2, R is 2x2
      // Need to transpose Q for proper multiplication since Q stores columns
      const QT = transpose(Q, 2, 2)
      const QR = matMul(QT, R, 2, 2, 2)

      for (let i = 0; i < 4; i++) {
        assert(
          approxEqual(QR[i], A[i], 1e-6),
          `QR[${i}] = ${QR[i]}, A[${i}] = ${A[i]}`
        )
      }
    })
  })

  describe('choleskyDecomposition', function () {
    it('should decompose positive-definite matrix', function () {
      // A = [[4, 2], [2, 5]] - symmetric positive definite
      const A = new Float64Array([4, 2, 2, 5])
      const result = choleskyDecomposition(A, 2)

      assert.strictEqual(isCholeskySuccess(result), true)

      const L = getCholeskyL(result)
      assert.strictEqual(L.length, 4)
    })

    it('should fail for non-positive-definite matrix', function () {
      // A = [[1, 2], [2, 1]] - not positive definite (det = -3)
      const A = new Float64Array([1, 2, 2, 1])
      const result = choleskyDecomposition(A, 2)

      assert.strictEqual(isCholeskySuccess(result), false)
    })

    it('should decompose 3x3 positive-definite matrix', function () {
      // A = [[4, 12, -16], [12, 37, -43], [-16, -43, 98]]
      const A = new Float64Array([4, 12, -16, 12, 37, -43, -16, -43, 98])
      const result = choleskyDecomposition(A, 3)

      assert.strictEqual(isCholeskySuccess(result), true)
    })

    it('should produce lower triangular L', function () {
      const A = new Float64Array([4, 2, 2, 5])
      const result = choleskyDecomposition(A, 2)
      const L = getCholeskyL(result)

      // Upper triangle (L[0,1]) should be 0
      assert(approxEqual(L[1], 0))
    })

    it('should satisfy A = L * L^T', function () {
      const A = new Float64Array([4, 2, 2, 5])
      const result = choleskyDecomposition(A, 2)
      const L = getCholeskyL(result)

      const LT = transpose(L, 2, 2)
      const LLT = matMul(L, LT, 2, 2, 2)

      for (let i = 0; i < 4; i++) {
        assert(approxEqual(LLT[i], A[i], 1e-6))
      }
    })
  })

  describe('luSolve', function () {
    it('should solve 2x2 system', function () {
      // A = [[2, 1], [1, 3]], b = [5, 10]
      // Solution: x = [1, 3]
      const A = new Float64Array([2, 1, 1, 3])
      const b = new Float64Array([5, 10])

      const luResult = luDecomposition(A, 2)
      const lu = getLUMatrix(luResult)
      const perm = getLUPerm(luResult)

      const x = luSolve(lu, 2, perm, b)

      assert(approxEqual(x[0], 1, 1e-6))
      assert(approxEqual(x[1], 3, 1e-6))
    })

    it('should solve 3x3 system', function () {
      // A = [[1, 2, 3], [4, 5, 6], [7, 8, 10]]
      // b = [6, 15, 25]
      // Solution: x = [1, 1, 1]
      const A = new Float64Array([1, 2, 3, 4, 5, 6, 7, 8, 10])
      const b = new Float64Array([6, 15, 25])

      const luResult = luDecomposition(A, 3)
      const lu = getLUMatrix(luResult)
      const perm = getLUPerm(luResult)

      const x = luSolve(lu, 3, perm, b)

      assert(approxEqual(x[0], 1, 1e-6))
      assert(approxEqual(x[1], 1, 1e-6))
      assert(approxEqual(x[2], 1, 1e-6))
    })

    it('should solve identity system', function () {
      const I = new Float64Array([1, 0, 0, 1])
      const b = new Float64Array([3, 7])

      const luResult = luDecomposition(I, 2)
      const lu = getLUMatrix(luResult)
      const perm = getLUPerm(luResult)

      const x = luSolve(lu, 2, perm, b)

      assert(approxEqual(x[0], 3))
      assert(approxEqual(x[1], 7))
    })
  })

  describe('luDeterminant', function () {
    it('should compute determinant of 2x2 matrix', function () {
      // A = [[4, 3], [6, 3]], det = 4*3 - 3*6 = -6
      const A = new Float64Array([4, 3, 6, 3])
      const luResult = luDecomposition(A, 2)
      const lu = getLUMatrix(luResult)
      const perm = getLUPerm(luResult)

      const det = luDeterminant(lu, 2, perm)
      assert(approxEqual(Math.abs(det), 6, 1e-6))
    })

    it('should compute determinant of identity matrix', function () {
      const I = new Float64Array([1, 0, 0, 0, 1, 0, 0, 0, 1])
      const luResult = luDecomposition(I, 3)
      const lu = getLUMatrix(luResult)
      const perm = getLUPerm(luResult)

      const det = luDeterminant(lu, 3, perm)
      assert(approxEqual(det, 1, 1e-6))
    })

    it('should compute determinant of 3x3 matrix', function () {
      // A = [[1, 2, 3], [4, 5, 6], [7, 8, 10]]
      // det = 1*(5*10-6*8) - 2*(4*10-6*7) + 3*(4*8-5*7)
      //     = 1*2 - 2*(-2) + 3*(-3) = 2 + 4 - 9 = -3
      const A = new Float64Array([1, 2, 3, 4, 5, 6, 7, 8, 10])
      const luResult = luDecomposition(A, 3)
      const lu = getLUMatrix(luResult)
      const perm = getLUPerm(luResult)

      const det = luDeterminant(lu, 3, perm)
      assert(approxEqual(Math.abs(det), 3, 1e-6))
    })
  })

  describe('decomposition properties', function () {
    it('LU and Cholesky should give same determinant for SPD matrix', function () {
      const A = new Float64Array([4, 2, 2, 5])

      // LU determinant
      const luResult = luDecomposition(A, 2)
      const lu = getLUMatrix(luResult)
      const perm = getLUPerm(luResult)
      const detLU = Math.abs(luDeterminant(lu, 2, perm))

      // Cholesky: det(A) = det(L)^2, det(L) = product of diagonal
      const cholResult = choleskyDecomposition(A, 2)
      const L = getCholeskyL(cholResult)
      const detL = L[0] * L[3]
      const detChol = detL * detL

      assert(approxEqual(detLU, detChol, 1e-6))
    })
  })
})
