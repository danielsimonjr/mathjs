import assert from 'assert'
import {
  schur,
  getSchurQ,
  getSchurT,
  schurEigenvalues,
  schurResidual,
  schurOrthogonalityError
} from '../../../../src/wasm/algebra/schur.ts'

const EPSILON = 1e-8

function approxEqual(a: number, b: number, eps: number = EPSILON): boolean {
  return Math.abs(a - b) < eps
}

describe('wasm/algebra/schur', function () {
  describe('schur', function () {
    it('should return empty array for n <= 0', function () {
      const result = schur(new Float64Array([1]), 0, 100, 1e-10)
      assert.strictEqual(result.length, 0)
    })

    it('should decompose 1x1 matrix', function () {
      const A = new Float64Array([5])
      const result = schur(A, 1, 100, 1e-10)

      assert.strictEqual(result.length, 2)
      const Q = getSchurQ(result, 1)
      const T = getSchurT(result, 1)

      // Q should be identity for 1x1
      assert(approxEqual(Q[0], 1))
      // T should equal A
      assert(approxEqual(T[0], 5))
    })

    it('should decompose 2x2 diagonal matrix', function () {
      // A = [[2, 0], [0, 3]]
      const A = new Float64Array([2, 0, 0, 3])
      const result = schur(A, 2, 100, 1e-10)

      assert.strictEqual(result.length, 8)
      const Q = getSchurQ(result, 2)
      const _T = getSchurT(result, 2)

      // For diagonal matrix, Q should be close to identity (possibly permuted)
      // T should have eigenvalues on diagonal
      const orthErr = schurOrthogonalityError(Q, 2)
      assert(orthErr < 1e-6, `Q is not orthogonal: error = ${orthErr}`)
    })

    it('should decompose 2x2 matrix with real eigenvalues', function () {
      // A = [[4, 1], [2, 3]] has eigenvalues 5 and 2
      const A = new Float64Array([4, 1, 2, 3])
      const result = schur(A, 2, 100, 1e-10)

      const Q = getSchurQ(result, 2)
      const T = getSchurT(result, 2)

      // Check A = Q * T * Q^T
      const residual = schurResidual(A, Q, T, 2)
      assert(residual < 1e-6, `Residual too large: ${residual}`)

      // Check Q is orthogonal
      const orthErr = schurOrthogonalityError(Q, 2)
      assert(orthErr < 1e-6, `Q is not orthogonal: error = ${orthErr}`)
    })

    it('should decompose 2x2 matrix with complex eigenvalues', function () {
      // A = [[0, -1], [1, 0]] has eigenvalues +/- i
      const A = new Float64Array([0, -1, 1, 0])
      const result = schur(A, 2, 100, 1e-10)

      const Q = getSchurQ(result, 2)
      const T = getSchurT(result, 2)

      // Check A = Q * T * Q^T
      const residual = schurResidual(A, Q, T, 2)
      assert(residual < 1e-6, `Residual too large: ${residual}`)

      // Check Q is orthogonal
      const orthErr = schurOrthogonalityError(Q, 2)
      assert(orthErr < 1e-6, `Q is not orthogonal: error = ${orthErr}`)
    })

    it('should decompose 3x3 matrix', function () {
      // A = [[1, 2, 3], [0, 4, 5], [0, 0, 6]]
      // Upper triangular, eigenvalues are 1, 4, 6
      const A = new Float64Array([1, 2, 3, 0, 4, 5, 0, 0, 6])
      const result = schur(A, 3, 100, 1e-10)

      const Q = getSchurQ(result, 3)
      const T = getSchurT(result, 3)

      // Check A = Q * T * Q^T
      const residual = schurResidual(A, Q, T, 3)
      assert(residual < 1e-5, `Residual too large: ${residual}`)

      // Check Q is orthogonal
      const orthErr = schurOrthogonalityError(Q, 3)
      assert(orthErr < 1e-5, `Q is not orthogonal: error = ${orthErr}`)
    })
  })

  describe('getSchurQ', function () {
    it('should extract Q matrix from result', function () {
      const A = new Float64Array([1])
      const result = schur(A, 1, 100, 1e-10)
      const Q = getSchurQ(result, 1)

      assert.strictEqual(Q.length, 1)
      assert(Q instanceof Float64Array)
    })
  })

  describe('getSchurT', function () {
    it('should extract T matrix from result', function () {
      const A = new Float64Array([1])
      const result = schur(A, 1, 100, 1e-10)
      const T = getSchurT(result, 1)

      assert.strictEqual(T.length, 1)
      assert(T instanceof Float64Array)
    })
  })

  describe('schurEigenvalues', function () {
    it('should extract eigenvalues from 1x1 T matrix', function () {
      const T = new Float64Array([5])
      const eig = schurEigenvalues(T, 1)

      // eig = [real..., imag...]
      assert.strictEqual(eig.length, 2)
      assert(approxEqual(eig[0], 5)) // real part
      assert(approxEqual(eig[1], 0)) // imag part
    })

    it('should extract real eigenvalues from diagonal T', function () {
      // T = [[3, 0], [0, 7]]
      const T = new Float64Array([3, 0, 0, 7])
      const eig = schurEigenvalues(T, 2)

      assert.strictEqual(eig.length, 4)
      // Eigenvalues 3 and 7 (order may vary)
      const realParts = [eig[0], eig[1]]
      const imagParts = [eig[2], eig[3]]

      assert(realParts.includes(3) || realParts.includes(7))
      assert(approxEqual(imagParts[0], 0))
      assert(approxEqual(imagParts[1], 0))
    })

    it('should extract complex eigenvalues from 2x2 block', function () {
      // T = [[0, -1], [1, 0]] has eigenvalues +/- i
      const T = new Float64Array([0, -1, 1, 0])
      const eig = schurEigenvalues(T, 2)

      // Real parts should be 0, imag parts should be +/- 1
      assert(approxEqual(eig[0], 0)) // real part 1
      assert(approxEqual(eig[1], 0)) // real part 2
      assert(approxEqual(Math.abs(eig[2]), 1)) // |imag part 1| = 1
      assert(approxEqual(Math.abs(eig[3]), 1)) // |imag part 2| = 1
      assert(approxEqual(eig[2] + eig[3], 0)) // conjugate pair
    })
  })

  describe('schurResidual', function () {
    it('should return 0 for exact decomposition', function () {
      // Identity matrix
      const A = new Float64Array([1, 0, 0, 1])
      const Q = new Float64Array([1, 0, 0, 1])
      const T = new Float64Array([1, 0, 0, 1])

      const residual = schurResidual(A, Q, T, 2)
      assert(approxEqual(residual, 0))
    })

    it('should detect incorrect decomposition', function () {
      const A = new Float64Array([1, 2, 3, 4])
      const Q = new Float64Array([1, 0, 0, 1]) // Identity
      const T = new Float64Array([0, 0, 0, 0]) // Zero

      const residual = schurResidual(A, Q, T, 2)
      assert(residual > 1) // Should be large
    })
  })

  describe('schurOrthogonalityError', function () {
    it('should return 0 for identity matrix', function () {
      const Q = new Float64Array([1, 0, 0, 1])
      const error = schurOrthogonalityError(Q, 2)
      assert(approxEqual(error, 0))
    })

    it('should return 0 for orthogonal rotation matrix', function () {
      // 45 degree rotation
      const c = Math.cos(Math.PI / 4)
      const s = Math.sin(Math.PI / 4)
      const Q = new Float64Array([c, -s, s, c])
      const error = schurOrthogonalityError(Q, 2)
      assert(approxEqual(error, 0))
    })

    it('should detect non-orthogonal matrix', function () {
      // Non-orthogonal matrix
      const Q = new Float64Array([1, 1, 0, 1])
      const error = schurOrthogonalityError(Q, 2)
      assert(error > 0.5) // Should be significant
    })
  })

  describe('Schur decomposition properties', function () {
    it('should preserve trace (sum of eigenvalues)', function () {
      const A = new Float64Array([4, 1, 2, 3])
      const trace = A[0] + A[3] // 4 + 3 = 7

      const result = schur(A, 2, 100, 1e-10)
      const T = getSchurT(result, 2)
      const eig = schurEigenvalues(T, 2)

      const sumReal = eig[0] + eig[1]
      assert(approxEqual(sumReal, trace))
    })

    it('should preserve determinant (product of eigenvalues)', function () {
      const A = new Float64Array([4, 1, 2, 3])
      const det = A[0] * A[3] - A[1] * A[2] // 4*3 - 1*2 = 10

      const result = schur(A, 2, 100, 1e-10)
      const T = getSchurT(result, 2)
      const eig = schurEigenvalues(T, 2)

      // Product of eigenvalues (real parts if all real)
      const prodReal = eig[0] * eig[1]
      assert(approxEqual(prodReal, det, 1e-5))
    })
  })
})
