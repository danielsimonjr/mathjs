import { factory } from '../../utils/factory.js'

const name = 'characteristicPolynomial'
const dependencies = ['typed', 'multiply', 'trace', 'identity', 'matrix', 'subtract', 'size']

export const createCharacteristicPolynomial = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed, multiply, trace, identity, matrix, subtract, size }) => {
    /**
     * Compute the characteristic polynomial of a square matrix A.
     *
     * The characteristic polynomial is det(λI - A), computed using the
     * Faddeev-LeVerrier algorithm. Returns an array of coefficients in
     * ascending order: [c_0, c_1, ..., c_n] where the polynomial is
     * c_0 + c_1*λ + c_2*λ^2 + ... + c_n*λ^n.
     *
     * Syntax:
     *
     *     math.characteristicPolynomial(A)
     *
     * Examples:
     *
     *     math.characteristicPolynomial([[2, 0], [0, 3]])
     *     // Returns [6, -5, 1]  (λ^2 - 5λ + 6)
     *
     *     math.characteristicPolynomial([[1, 0], [0, 1]])
     *     // Returns [1, -2, 1]  (λ^2 - 2λ + 1)
     *
     * See also:
     *
     *     eigs, det, trace
     *
     * @param {Array | Matrix} A  A square matrix
     * @return {number[]}         Polynomial coefficients [c_0, c_1, ..., c_n]
     */
    return typed(name, {
      Array: function (A) {
        return _characteristicPolynomial(A)
      },

      Matrix: function (A) {
        return _characteristicPolynomial(A.toArray())
      }
    })

    function _matMul (A, B) {
      const m = A.length
      const n = B[0].length
      const p = B.length
      const C = []
      for (let i = 0; i < m; i++) {
        C.push(new Array(n).fill(0))
        for (let j = 0; j < n; j++) {
          let s = 0
          for (let k = 0; k < p; k++) {
            s += A[i][k] * B[k][j]
          }
          C[i][j] = s
        }
      }
      return C
    }

    function _matTrace (M) {
      let t = 0
      for (let i = 0; i < M.length; i++) {
        t += M[i][i]
      }
      return t
    }

    function _characteristicPolynomial (A) {
      const n = A.length
      for (let i = 0; i < n; i++) {
        if (!Array.isArray(A[i]) || A[i].length !== n) {
          throw new Error('characteristicPolynomial: matrix must be square')
        }
      }

      // Faddeev-LeVerrier algorithm
      // Computes coefficients of det(λI - A)
      // c[n] = 1 (leading coeff, monic polynomial)
      // k=1: M_1 = A,  c[n-1] = -(1/1)*trace(M_1)
      // k>1: M_k = A*(M_{k-1} + c[n-k+1]*I),  c[n-k] = -(1/k)*trace(M_k)

      const coeffs = new Array(n + 1).fill(0)
      coeffs[n] = 1

      // k=1: initialize M = A, compute c[n-1]
      let M = A.map(row => [...row])
      coeffs[n - 1] = -(1 / 1) * _matTrace(M)

      // k=2..n
      for (let k = 2; k <= n; k++) {
        const c = coeffs[n - k + 1]

        // temp = M + c*I
        const temp = M.map(row => [...row])
        for (let i = 0; i < n; i++) {
          temp[i][i] += c
        }

        // M = A * temp
        M = _matMul(A, temp)

        // c[n-k] = -(1/k) * trace(M)
        coeffs[n - k] = -(1 / k) * _matTrace(M)
      }

      return coeffs
    }
  }
)
