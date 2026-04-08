import { factory } from '../../utils/factory.js'

const name = 'quadprog'
const dependencies = ['typed']

export const createQuadprog = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }) => {
    /**
     * Solve a quadratic programming problem using an active-set method.
     *
     * Minimizes  (1/2) x'Hx + f'x
     * subject to A*x <= b
     *            Aeq*x = beq  (optional)
     *
     * H must be symmetric positive (semi)definite.
     *
     * Syntax:
     *
     *    math.quadprog(H, f, A, b)
     *    math.quadprog(H, f, A, b, Aeq, beq)
     *
     * Examples:
     *
     *    quadprog([[2, 0], [0, 2]], [-2, -5], [[1, -2], [-1, -2], [-1, 2], [1, 0], [0, 1]], [2, 6, 2, 20, 20])
     *
     * See also:
     *
     *    linprog, minimize
     *
     * @param {Array}  H    Quadratic cost matrix (n x n), symmetric positive definite
     * @param {Array}  f    Linear cost vector (length n)
     * @param {Array}  A    Inequality constraint matrix (m x n)
     * @param {Array}  b    Inequality right-hand side (length m)
     * @param {Array}  [Aeq]  Equality constraint matrix (meq x n)
     * @param {Array}  [beq]  Equality right-hand side (length meq)
     * @return {Object}  Result with properties: x (array), fval (number), status (string), iterations (number)
     */
    return typed(name, {
      'Array, Array, Array, Array': function (H, f, A, b) {
        return _quadprog(H, f, A, b, [], [])
      },
      'Array, Array, Array, Array, Array, Array': function (H, f, A, b, Aeq, beq) {
        return _quadprog(H, f, A, b, Aeq, beq)
      }
    })

    /**
     * Primal active-set method for QP.
     * Starts from x=0 (feasibility check skipped for simplicity — user must provide feasible region containing origin).
     * Uses gradient projection and KKT conditions.
     */
    function _quadprog (H, f, A, b, Aeq, beq) {
      const n = H.length
      const m = A.length
      const meq = Aeq.length
      const maxIter = 200

      // Start at x = 0; if not feasible, find a feasible starting point via projection
      let x = new Array(n).fill(0)

      // Check initial feasibility for inequalities
      for (let i = 0; i < m; i++) {
        const ax = _dot(A[i], x)
        if (ax > b[i] + 1e-10) {
          // Try to move x to feasibility via unconstrained minimization with penalty
          x = _findFeasiblePoint(A, b, n, m)
          break
        }
      }

      // Active set: initially includes only equality constraints
      const activeSet = new Set()
      for (let i = 0; i < meq; i++) activeSet.add(m + i) // equality indices offset by m

      let iter = 0
      for (iter = 0; iter < maxIter; iter++) {
        // Compute gradient at x: g = Hx + f
        const g = _matVec(H, x)
        for (let i = 0; i < n; i++) g[i] += f[i]

        // Build active constraint matrix Wa
        const activeArr = Array.from(activeSet)
        const Wa = []
        const ba = []
        for (const idx of activeArr) {
          if (idx < m) {
            Wa.push(A[idx].slice())
            ba.push(b[idx])
          } else {
            Wa.push(Aeq[idx - m].slice())
            ba.push(beq[idx - m])
          }
        }

        // Solve KKT system for step direction p and multipliers lambda
        // [H  Wa'] [p]   = [-g]
        // [Wa  0 ] [lam]   [0 ]
        // Compute constraint residuals for active constraints: ba - Wa*x
        const activeResiduals = Wa.map((row, k) => {
          const idx = activeArr[k]
          const rhs = idx < m ? b[idx] : beq[idx - m]
          return rhs - _dot(row, x)
        })
        const { p, lambda } = _solveKKT(H, g, Wa, activeResiduals, n)

        const pNorm = Math.sqrt(_dot(p, p))

        if (pNorm < 1e-10) {
          // p ≈ 0: check multipliers for inequality constraints in active set
          let minLambda = 0
          let minIdx = -1
          let k = 0
          for (const idx of activeArr) {
            if (idx < m) { // inequality constraint
              if (lambda[k] < minLambda) {
                minLambda = lambda[k]
                minIdx = idx
              }
            }
            k++
          }
          if (minIdx === -1) {
            // All multipliers non-negative or only equalities: KKT satisfied
            break
          }
          // Remove most negative multiplier constraint from active set
          activeSet.delete(minIdx)
          continue
        }

        // Compute step length alpha: limited by inactive inequality constraints
        let alpha = 1.0
        let blockingIdx = -1
        for (let i = 0; i < m; i++) {
          if (activeSet.has(i)) continue
          const ap = _dot(A[i], p)
          if (ap > 1e-10) {
            const ax = _dot(A[i], x)
            const alphaI = (b[i] - ax) / ap
            if (alphaI < alpha) {
              alpha = alphaI
              blockingIdx = i
            }
          }
        }

        // Move to x + alpha * p
        for (let i = 0; i < n; i++) x[i] += alpha * p[i]

        if (blockingIdx !== -1 && alpha < 1.0) {
          activeSet.add(blockingIdx)
        }
      }

      // Compute objective value
      const Hx = _matVec(H, x)
      let fval = 0
      for (let i = 0; i < n; i++) fval += 0.5 * x[i] * Hx[i] + f[i] * x[i]

      const status = iter < maxIter ? 'optimal' : 'max_iterations'
      return { x, fval, status, iterations: iter }
    }

    function _findFeasiblePoint (A, b, n, m) {
      // Gradient descent on max(0, A[i]x - b[i])^2 to find feasible point
      const x = new Array(n).fill(0)
      const lr = 0.01
      for (let iter = 0; iter < 500; iter++) {
        const grad = new Array(n).fill(0)
        let feasible = true
        for (let i = 0; i < m; i++) {
          const viol = _dot(A[i], x) - b[i]
          if (viol > 0) {
            feasible = false
            for (let j = 0; j < n; j++) grad[j] += 2 * viol * A[i][j]
          }
        }
        if (feasible) break
        for (let j = 0; j < n; j++) x[j] -= lr * grad[j]
      }
      return x
    }

    function _solveKKT (H, g, Wa, residuals, n) {
      const na = Wa.length
      const size = n + na

      // Build block matrix M = [[H, Wa'], [Wa, 0]]
      // RHS = [-g; residuals] where residuals[k] = ba[k] - Wa[k]*x
      const M = []
      for (let i = 0; i < size; i++) {
        M.push(new Array(size + 1).fill(0))
      }
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) M[i][j] = H[i][j]
        M[i][size] = -g[i]
      }
      for (let k = 0; k < na; k++) {
        for (let j = 0; j < n; j++) {
          M[n + k][j] = Wa[k][j]
          M[j][n + k] = Wa[k][j]
        }
        M[n + k][size] = residuals[k]
      }

      // Gaussian elimination with partial pivoting
      _gaussianElimination(M, size)

      const sol = new Array(size).fill(0)
      for (let i = size - 1; i >= 0; i--) {
        let s = M[i][size]
        for (let j = i + 1; j < size; j++) s -= M[i][j] * sol[j]
        sol[i] = Math.abs(M[i][i]) > 1e-14 ? s / M[i][i] : 0
      }

      return { p: sol.slice(0, n), lambda: sol.slice(n) }
    }

    function _gaussianElimination (M, size) {
      for (let col = 0; col < size; col++) {
        // Partial pivot
        let maxRow = col
        let maxVal = Math.abs(M[col][col])
        for (let row = col + 1; row < size; row++) {
          if (Math.abs(M[row][col]) > maxVal) {
            maxVal = Math.abs(M[row][col])
            maxRow = row
          }
        }
        if (maxRow !== col) {
          const tmp = M[col]; M[col] = M[maxRow]; M[maxRow] = tmp
        }
        if (Math.abs(M[col][col]) < 1e-14) continue
        for (let row = col + 1; row < size; row++) {
          const factor = M[row][col] / M[col][col]
          for (let j = col; j <= size; j++) {
            M[row][j] -= factor * M[col][j]
          }
        }
      }
    }

    function _matVec (A, x) {
      const n = x.length
      const y = new Array(n).fill(0)
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) y[i] += A[i][j] * x[j]
      }
      return y
    }

    function _dot (a, b) {
      let s = 0
      for (let i = 0; i < a.length; i++) s += a[i] * b[i]
      return s
    }
  }
)
