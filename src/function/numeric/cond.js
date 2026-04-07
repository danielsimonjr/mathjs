import { factory } from '../../utils/factory.js'

const name = 'cond'
const dependencies = ['typed']

export const createCond = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }) => {
    /**
     * Compute the condition number of a matrix.
     *
     * The condition number measures how sensitive the solution of a linear system
     * is to perturbations. A large condition number indicates an ill-conditioned matrix.
     *
     * Supported norms:
     * - p=1: maximum absolute column sum
     * - p=2 (default): ratio of largest to smallest singular value (via power iteration)
     * - p=Infinity: maximum absolute row sum
     *
     * Syntax:
     *
     *    math.cond(A)
     *    math.cond(A, p)
     *
     * Examples:
     *
     *    math.cond([[1, 0], [0, 1]])   // 1 (identity matrix)
     *    math.cond([[1, 2], [3, 4]])   // ~14.9
     *    math.cond([[1, 0], [0, 1]], 1) // 1
     *
     * See also:
     *
     *    rank, nullspace, det, inv
     *
     * @param {Array} A    The matrix (2D square array)
     * @param {number} [p]  Norm type: 1, 2, or Infinity (default 2)
     * @return {number}    The condition number
     */
    return typed(name, {
      Array: function (A) {
        return _cond(A, 2)
      },
      'Array, number': function (A, p) {
        if (p !== 1 && p !== 2 && p !== Infinity) {
          throw new Error('cond: p must be 1, 2, or Infinity')
        }
        return _cond(A, p)
      }
    })

    function _norm1 (A) {
      // Maximum absolute column sum
      const m = A.length
      const n = A[0].length
      let maxSum = 0
      for (let j = 0; j < n; j++) {
        let colSum = 0
        for (let i = 0; i < m; i++) {
          colSum += Math.abs(A[i][j])
        }
        if (colSum > maxSum) maxSum = colSum
      }
      return maxSum
    }

    function _normInf (A) {
      // Maximum absolute row sum
      let maxSum = 0
      for (const row of A) {
        const rowSum = row.reduce((s, v) => s + Math.abs(v), 0)
        if (rowSum > maxSum) maxSum = rowSum
      }
      return maxSum
    }

    function _matMul (A, B) {
      const m = A.length
      const n = B[0].length
      const p = B.length
      const C = Array.from({ length: m }, () => new Array(n).fill(0))
      for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
          for (let k = 0; k < p; k++) {
            C[i][j] += A[i][k] * B[k][j]
          }
        }
      }
      return C
    }

    function _transpose (A) {
      return A[0].map((_, j) => A.map(row => row[j]))
    }

    function _norm2 (v) {
      return Math.sqrt(v.reduce((s, x) => s + x * x, 0))
    }

    function _powerIteration (A) {
      // Estimate largest singular value via power iteration on A^T A
      const n = A[0].length
      let v = new Array(n).fill(1 / Math.sqrt(n))
      const AT = _transpose(A)
      const ATA = _matMul(AT, A)

      for (let iter = 0; iter < 100; iter++) {
        // Multiply ATA * v
        const Av = new Array(n).fill(0)
        for (let i = 0; i < n; i++) {
          for (let j = 0; j < n; j++) {
            Av[i] += ATA[i][j] * v[j]
          }
        }
        const normAv = _norm2(Av)
        if (normAv < 1e-15) break
        const vnew = Av.map(x => x / normAv)
        // Check convergence
        const diff = _norm2(v.map((vi, i) => vi - vnew[i]))
        v = vnew
        if (diff < 1e-12) break
      }

      // Compute Rayleigh quotient = lambda_max of ATA = sigma_max^2
      const Av = new Array(n).fill(0)
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          Av[i] += ATA[i][j] * v[j]
        }
      }
      const sigmaMax = Math.sqrt(Math.abs(Av.reduce((s, x, i) => s + x * v[i], 0)))

      // Estimate smallest singular value: sigma_min = sigma_max / cond
      // Use inverse power iteration on ATA
      // Start with a vector orthogonal to the dominant direction
      let u = new Array(n).fill(0)
      u[(v.indexOf(Math.max(...v.map(Math.abs))) + 1) % n] = 1
      // Orthogonalize u against v
      const dot = u.reduce((s, ui, i) => s + ui * v[i], 0)
      u = u.map((ui, i) => ui - dot * v[i])
      const nu = _norm2(u)
      if (nu > 1e-15) {
        u = u.map(ui => ui / nu)
      } else {
        u = new Array(n).fill(1 / Math.sqrt(n))
      }

      // Solve ATA * z = u iteratively (shifted inverse power iteration approximation)
      // For simplicity, use the fact that sigma_min can be estimated via Lanczos
      // We'll use a simpler approach: run inverse power iteration with Gaussian elimination
      let sigmaMin = sigmaMax // default: well-conditioned
      try {
        // Build ATA - shift * I and solve
        const shift = sigmaMax * sigmaMax * 1e-6
        const ATAshifted = ATA.map((row, i) => row.map((v, j) => v - (i === j ? shift : 0)))

        // Power iteration on (ATA + shift*I)^{-1} to find smallest eigenvalue
        for (let iter = 0; iter < 50; iter++) {
          // Solve ATAshifted * z = u via Gaussian elimination
          const z = _solveSystem(ATAshifted, u)
          const normZ = _norm2(z)
          if (normZ < 1e-15) break
          const unew = z.map(zi => zi / normZ)
          const diff = _norm2(u.map((ui, i) => ui - unew[i]))
          u = unew
          if (diff < 1e-10) break
        }

        // Compute eigenvalue of ATA for u
        const Au = new Array(n).fill(0)
        for (let i = 0; i < n; i++) {
          for (let j = 0; j < n; j++) {
            Au[i] += ATA[i][j] * u[j]
          }
        }
        const lambda = Math.abs(Au.reduce((s, x, i) => s + x * u[i], 0))
        sigmaMin = Math.sqrt(lambda)
      } catch (e) {
        // Singular or near-singular: condition number is very large
        return Infinity
      }

      if (sigmaMin < 1e-15) return Infinity
      return sigmaMax / sigmaMin
    }

    function _solveSystem (A, b) {
      const n = A.length
      const aug = A.map((row, i) => [...row, b[i]])

      for (let col = 0; col < n; col++) {
        let maxRow = col
        let maxVal = Math.abs(aug[col][col])
        for (let row = col + 1; row < n; row++) {
          if (Math.abs(aug[row][col]) > maxVal) {
            maxVal = Math.abs(aug[row][col])
            maxRow = row
          }
        }

        if (maxVal < 1e-15) throw new Error('singular')

        if (maxRow !== col) {
          const tmp = aug[col]; aug[col] = aug[maxRow]; aug[maxRow] = tmp
        }

        for (let row = col + 1; row < n; row++) {
          const factor = aug[row][col] / aug[col][col]
          for (let k = col; k <= n; k++) {
            aug[row][k] -= factor * aug[col][k]
          }
        }
      }

      const x = new Array(n).fill(0)
      for (let i = n - 1; i >= 0; i--) {
        x[i] = aug[i][n]
        for (let j = i + 1; j < n; j++) {
          x[i] -= aug[i][j] * x[j]
        }
        x[i] /= aug[i][i]
      }
      return x
    }

    function _condNorm (A, Ainv, normFn) {
      return normFn(A) * normFn(Ainv)
    }

    function _invert (A) {
      const n = A.length
      // Augment with identity
      const aug = A.map((row, i) => {
        const r = [...row]
        for (let j = 0; j < n; j++) r.push(i === j ? 1 : 0)
        return r
      })

      for (let col = 0; col < n; col++) {
        let maxRow = col
        let maxVal = Math.abs(aug[col][col])
        for (let row = col + 1; row < n; row++) {
          if (Math.abs(aug[row][col]) > maxVal) {
            maxVal = Math.abs(aug[row][col])
            maxRow = row
          }
        }
        if (maxVal < 1e-15) throw new Error('cond: matrix is singular')

        if (maxRow !== col) {
          const tmp = aug[col]; aug[col] = aug[maxRow]; aug[maxRow] = tmp
        }

        const pivot = aug[col][col]
        for (let k = 0; k < 2 * n; k++) aug[col][k] /= pivot

        for (let row = 0; row < n; row++) {
          if (row === col) continue
          const factor = aug[row][col]
          for (let k = 0; k < 2 * n; k++) {
            aug[row][k] -= factor * aug[col][k]
          }
        }
      }

      return aug.map(row => row.slice(n))
    }

    function _cond (A, p) {
      const m = A.length
      const n = A[0].length

      if (p === 2) {
        // Use power iteration for 2-norm condition number
        return _powerIteration(A)
      }

      // For 1-norm and Inf-norm, we need the inverse (only for square matrices)
      if (m !== n) {
        throw new Error('cond: matrix must be square for p=1 or p=Infinity norms')
      }

      const Ainv = _invert(A)
      if (p === 1) return _condNorm(A, Ainv, _norm1)
      return _condNorm(A, Ainv, _normInf)
    }
  }
)
