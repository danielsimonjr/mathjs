import { factory } from '../../utils/factory.js'

const name = 'linprog'
const dependencies = ['typed']

export const createLinprog = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }) => {
    /**
     * Solve a linear programming problem using the revised simplex method.
     *
     * Minimizes  c^T x
     * subject to A*x <= b
     *            Aeq*x = beq  (optional)
     *            x >= 0
     *
     * Syntax:
     *
     *    math.linprog(c, A, b)
     *    math.linprog(c, A, b, Aeq, beq)
     *
     * Examples:
     *
     *    linprog([-1, -2], [[1, 1], [1, 0], [0, 1]], [4, 3, 2])
     *
     * See also:
     *
     *    quadprog, minimize
     *
     * @param {Array}  c    Objective coefficient vector (length n)
     * @param {Array}  A    Inequality constraint matrix (m x n)
     * @param {Array}  b    Inequality right-hand side vector (length m)
     * @param {Array}  [Aeq]  Equality constraint matrix (meq x n)
     * @param {Array}  [beq]  Equality right-hand side vector (length meq)
     * @return {Object}  Result with properties: x (array), fval (number), status (string)
     */
    return typed(name, {
      'Array, Array, Array': function (c, A, b) {
        return _linprog(c, A, b, [], [])
      },
      'Array, Array, Array, Array, Array': function (c, A, b, Aeq, beq) {
        return _linprog(c, A, b, Aeq, beq)
      }
    })

    /**
     * Two-phase simplex for LP.
     *
     * For each row i of the combined constraint set:
     *  - Inequality Ai*x <= bi (bi >= 0): standard form Ai*x + si = bi, si >= 0 (slack basic).
     *  - Inequality Ai*x <= bi (bi < 0): multiply by -1: -Ai*x >= -bi (rhs > 0).
     *    Then: -Ai*x - si + arti = -bi (si surplus, arti artificial).
     *    At x=0: arti = -bi > 0. Phase I drives arti to 0.
     *  - Equality Aeq*x = beq (beq >= 0): Aeq*x + arti = beq, arti basic.
     *  - Equality Aeq*x = beq (beq < 0): multiply by -1: -Aeq*x = -beq (rhs > 0).
     *    Then: -Aeq*x + arti = -beq, arti basic.
     *
     * Phase I objective: minimize sum of all artificial variables.
     * Phase II objective: minimize c^T x.
     */
    function _linprog (c, A, b, Aeq, beq) {
      const n = c.length
      const m = A.length
      const meq = Aeq.length
      const totalRows = m + meq

      // Determine which rows need artificials:
      // - All rows with b < 0 (infeasible at x=0)
      // - All equality rows
      // - Inequality rows with b >= 0 use slack as basic (no artificial needed for Phase I)
      const rowType = [] // 'slack_basic' or 'art_basic'
      for (let i = 0; i < m; i++) {
        rowType.push(b[i] >= 0 ? 'slack_basic' : 'art_basic')
      }
      for (let i = 0; i < meq; i++) {
        rowType.push('art_basic')
      }

      const numSlack = m // one slack per inequality row
      const numArt = totalRows // one artificial per row (only needed for art_basic rows)
      const totalVars = n + numSlack + numArt
      const RHS = totalVars

      // Build combined tableau
      const tab = []
      for (let i = 0; i <= totalRows; i++) {
        tab.push(new Array(totalVars + 1).fill(0))
      }

      const basis = new Array(totalRows).fill(-1)

      // Fill inequality rows
      for (let i = 0; i < m; i++) {
        const artIdx = n + numSlack + i
        if (b[i] >= 0) {
          // Ax + s = b, s basic at b >= 0
          for (let j = 0; j < n; j++) tab[i][j] = A[i][j]
          tab[i][n + i] = 1 // slack
          tab[i][artIdx] = 0
          tab[i][RHS] = b[i]
          basis[i] = n + i // slack is basic
        } else {
          // Ax <= b (b < 0): multiply by -1: -Ax >= -b (rhs -b > 0)
          // -Ax - s + art = -b, art basic at -b > 0
          for (let j = 0; j < n; j++) tab[i][j] = -A[i][j]
          tab[i][n + i] = -1 // surplus (coefficient -1)
          tab[i][artIdx] = 1 // artificial
          tab[i][RHS] = -b[i]
          basis[i] = artIdx // artificial is basic
        }
      }

      // Fill equality rows
      for (let i = 0; i < meq; i++) {
        const row = m + i
        const artIdx = n + numSlack + m + i
        if (beq[i] >= 0) {
          for (let j = 0; j < n; j++) tab[row][j] = Aeq[i][j]
          tab[row][artIdx] = 1
          tab[row][RHS] = beq[i]
        } else {
          // Multiply by -1
          for (let j = 0; j < n; j++) tab[row][j] = -Aeq[i][j]
          tab[row][artIdx] = 1
          tab[row][RHS] = -beq[i]
        }
        basis[row] = artIdx
      }

      // Check if any artificials are needed
      const needsPhaseI = rowType.some(t => t === 'art_basic')

      if (needsPhaseI) {
        // Phase I: minimize sum of artificials
        const p1Obj = tab[totalRows]
        // Set objective: coefficient +1 for all artificial variables that are 'art_basic'
        for (let i = 0; i < totalRows; i++) {
          if (rowType[i] === 'art_basic') {
            const artIdx = i < m ? n + numSlack + i : n + numSlack + i
            p1Obj[artIdx] = 1
          }
        }

        // Eliminate basic artificials from Phase I objective
        for (let i = 0; i < totalRows; i++) {
          if (rowType[i] === 'art_basic') {
            const artIdx = basis[i]
            const coeff = p1Obj[artIdx]
            if (Math.abs(coeff) > 1e-15) {
              for (let j = 0; j <= totalVars; j++) {
                p1Obj[j] -= coeff * tab[i][j]
              }
            }
          }
        }

        // Run Phase I simplex
        const maxIter = 20 * totalVars
        for (let iter = 0; iter < maxIter; iter++) {
          let pivCol = -1
          let minVal = -1e-10
          for (let j = 0; j < totalVars; j++) {
            if (p1Obj[j] < minVal) { minVal = p1Obj[j]; pivCol = j }
          }
          if (pivCol === -1) break

          let pivRow = -1
          let minRatio = Infinity
          for (let i = 0; i < totalRows; i++) {
            if (tab[i][pivCol] > 1e-10) {
              const ratio = tab[i][RHS] / tab[i][pivCol]
              if (ratio < minRatio) { minRatio = ratio; pivRow = i }
            }
          }
          if (pivRow === -1) break

          _pivot(tab, pivRow, pivCol, totalRows, totalVars)
          basis[pivRow] = pivCol
        }

        // Check feasibility
        const p1ObjVal = -tab[totalRows][RHS]
        if (Math.abs(p1ObjVal) > 1e-6) {
          return { x: new Array(n).fill(0), fval: 0, status: 'infeasible' }
        }
      }

      // Phase II: minimize c^T x
      tab[totalRows].fill(0)
      for (let j = 0; j < n; j++) tab[totalRows][j] = c[j]

      // Eliminate current basic variables from Phase II objective
      for (let i = 0; i < totalRows; i++) {
        const bv = basis[i]
        if (bv < n) {
          const coeff = tab[totalRows][bv]
          if (Math.abs(coeff) > 1e-15) {
            for (let j = 0; j <= totalVars; j++) {
              tab[totalRows][j] -= coeff * tab[i][j]
            }
          }
        }
      }

      const maxIter2 = 20 * totalVars
      for (let iter = 0; iter < maxIter2; iter++) {
        let pivCol = -1
        let minVal = -1e-10
        // Skip artificial variable columns in Phase II (they should not re-enter basis)
        const artStart = n + numSlack
        const artEnd = n + numSlack + numArt
        for (let j = 0; j < totalVars; j++) {
          if (j >= artStart && j < artEnd) continue // skip artificials
          if (tab[totalRows][j] < minVal) { minVal = tab[totalRows][j]; pivCol = j }
        }
        if (pivCol === -1) break

        let pivRow = -1
        let minRatio = Infinity
        for (let i = 0; i < totalRows; i++) {
          if (tab[i][pivCol] > 1e-10) {
            const ratio = tab[i][RHS] / tab[i][pivCol]
            if (ratio < minRatio) { minRatio = ratio; pivRow = i }
          }
        }
        if (pivRow === -1) {
          return { x: new Array(n).fill(0), fval: -Infinity, status: 'unbounded' }
        }

        _pivot(tab, pivRow, pivCol, totalRows, totalVars)
        basis[pivRow] = pivCol
      }

      const x = new Array(n).fill(0)
      for (let i = 0; i < totalRows; i++) {
        if (basis[i] < n) {
          x[basis[i]] = tab[i][RHS]
        }
      }
      const fval = -tab[totalRows][RHS]
      return { x, fval, status: 'optimal' }
    }

    function _pivot (tab, pivRow, pivCol, numRows, numCols) {
      const pivVal = tab[pivRow][pivCol]
      for (let j = 0; j <= numCols; j++) tab[pivRow][j] /= pivVal
      for (let i = 0; i <= numRows; i++) {
        if (i !== pivRow) {
          const factor = tab[i][pivCol]
          if (Math.abs(factor) > 1e-15) {
            for (let j = 0; j <= numCols; j++) tab[i][j] -= factor * tab[pivRow][j]
          }
        }
      }
    }
  }
)
