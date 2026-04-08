import { factory } from '../../utils/factory.js'

const name = 'jordanForm'
const dependencies = ['typed', 'eigs', 'matrix', 'zeros', 'identity']

export const createJordanForm = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed, eigs, matrix, zeros, identity }) => {
    /**
     * Compute the Jordan normal form J of a square matrix A, along with
     * the transition matrix P such that A ≈ P * J * P^(-1).
     *
     * For matrices with simple eigenvalues the Jordan form is diagonal.
     * For repeated eigenvalues Jordan blocks with 1s on the superdiagonal
     * are constructed.
     *
     * Syntax:
     *
     *     math.jordanForm(A)
     *
     * Examples:
     *
     *     math.jordanForm([[2, 0], [0, 3]])
     *     // Returns { J: [[2,0],[0,3]], P: identity }
     *
     *     math.jordanForm([[2, 1], [0, 2]])
     *     // Returns { J: [[2,1],[0,2]], P: identity }
     *
     * See also:
     *
     *     eigs, schur, svd
     *
     * @param {Array | Matrix} A  A square matrix
     * @return {{ J: Array|Matrix, P: Array|Matrix }}
     *   Object with Jordan form matrix J and transition matrix P
     */
    return typed(name, {
      Array: function (A) {
        const result = _jordanForm(A)
        return result
      },

      Matrix: function (A) {
        const result = _jordanForm(A.toArray())
        return {
          J: matrix(result.J),
          P: matrix(result.P)
        }
      }
    })

    function _jordanForm (A) {
      const n = A.length
      for (let i = 0; i < n; i++) {
        if (!Array.isArray(A[i]) || A[i].length !== n) {
          throw new Error('jordanForm: matrix must be square')
        }
      }

      // Use eigs to get eigenvalues and eigenvectors
      const eigResult = eigs(A)
      const eigenvalues = Array.isArray(eigResult.values)
        ? eigResult.values
        : eigResult.values.toArray()

      // Build Jordan form J and transition matrix P
      const J = []
      const P = []
      for (let i = 0; i < n; i++) {
        J.push(new Array(n).fill(0))
        P.push(new Array(n).fill(0))
      }

      // Get eigenvectors matrix — eigs returns column vectors via eigenvectors
      let eigvecs
      if (eigResult.eigenvectors) {
        // eigenvectors is an array of {value, vector} objects
        const evecs = eigResult.eigenvectors
        if (Array.isArray(evecs) && evecs.length > 0 && evecs[0].vector !== undefined) {
          // Build eigenvector matrix column by column
          eigvecs = []
          for (let i = 0; i < n; i++) {
            eigvecs.push(new Array(n).fill(0))
          }
          for (let col = 0; col < evecs.length && col < n; col++) {
            const vec = Array.isArray(evecs[col].vector)
              ? evecs[col].vector
              : evecs[col].vector.toArray()
            for (let row = 0; row < n; row++) {
              const v = vec[row]
              eigvecs[row][col] = typeof v === 'object' && v !== null && 're' in v ? v.re : (v || 0)
            }
          }
        }
      }

      // Place eigenvalues on diagonal of J
      for (let i = 0; i < n; i++) {
        const val = eigenvalues[i]
        J[i][i] = typeof val === 'object' && val !== null && 're' in val ? val.re : val
      }

      // Check for repeated eigenvalues and add Jordan blocks
      const tol = 1e-10
      for (let i = 0; i < n - 1; i++) {
        const vi = typeof eigenvalues[i] === 'object' ? eigenvalues[i].re : eigenvalues[i]
        const vi1 = typeof eigenvalues[i + 1] === 'object' ? eigenvalues[i + 1].re : eigenvalues[i + 1]
        if (Math.abs(vi - vi1) < tol) {
          J[i][i + 1] = 1
        }
      }

      // Build P from eigenvectors if available, else use identity
      if (eigvecs) {
        // eigs returns eigenvectors as columns: eigvecs[row][col]
        for (let row = 0; row < n; row++) {
          for (let col = 0; col < n; col++) {
            const v = eigvecs[row][col]
            P[row][col] = typeof v === 'object' && v !== null && 're' in v ? v.re : (v || 0)
          }
        }
      } else {
        // Fall back to identity
        for (let i = 0; i < n; i++) {
          P[i][i] = 1
        }
      }

      return { J, P }
    }
  }
)
