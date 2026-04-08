import { factory } from '../../utils/factory.js'

const name = 'principalComponentAnalysis'
const dependencies = ['typed']

export const createPrincipalComponentAnalysis = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }) => {
    /**
     * Principal Component Analysis (PCA).
     *
     * Centers the data (subtracts mean per column), computes the covariance
     * matrix, then decomposes it via the Jacobi eigenvalue algorithm.
     * Returns components sorted by descending eigenvalue.
     *
     * Returns an object with:
     *   - components: eigenvectors as rows (each row is a principal component)
     *   - eigenvalues: corresponding eigenvalues in descending order
     *   - scores: data projected onto principal components
     *   - explainedVariance: fraction of total variance explained per component
     *
     * Syntax:
     *
     *     math.principalComponentAnalysis(data)
     *
     * Examples:
     *
     *     principalComponentAnalysis([[1, 2], [3, 4], [5, 6]])
     *     principalComponentAnalysis([[2, 0, 0], [0, 3, 4], [0, 4, 3]])
     *
     * See also:
     *
     *     variance, covariance, corr
     *
     * @param {Array} data  2D array: rows = observations, columns = variables
     * @return {Object}     Object with components, eigenvalues, scores, explainedVariance
     */
    return typed(name, {
      Array: function (data) {
        if (!Array.isArray(data) || data.length < 2) {
          throw new Error('principalComponentAnalysis: data must have at least 2 rows')
        }
        const n = data.length
        const p = data[0].length
        if (p < 1) {
          throw new Error('principalComponentAnalysis: data must have at least 1 column')
        }
        for (let i = 1; i < n; i++) {
          if (data[i].length !== p) {
            throw new Error('principalComponentAnalysis: all rows must have the same length')
          }
        }

        // Step 1: center data
        const means = new Array(p).fill(0)
        for (let i = 0; i < n; i++) {
          for (let j = 0; j < p; j++) {
            means[j] += data[i][j]
          }
        }
        for (let j = 0; j < p; j++) means[j] /= n

        const centered = []
        for (let i = 0; i < n; i++) {
          const row = new Array(p)
          for (let j = 0; j < p; j++) {
            row[j] = data[i][j] - means[j]
          }
          centered.push(row)
        }

        // Step 2: covariance matrix (p x p), using n-1 denominator
        const cov = []
        for (let j = 0; j < p; j++) {
          cov.push(new Array(p).fill(0))
        }
        for (let i = 0; i < n; i++) {
          for (let j = 0; j < p; j++) {
            for (let k = j; k < p; k++) {
              cov[j][k] += centered[i][j] * centered[i][k]
            }
          }
        }
        const denom = n > 1 ? n - 1 : 1
        for (let j = 0; j < p; j++) {
          for (let k = j; k < p; k++) {
            cov[j][k] /= denom
            cov[k][j] = cov[j][k]
          }
        }

        // Step 3: Jacobi eigenvalue decomposition of symmetric matrix
        const { eigenvalues, eigenvectors } = jacobiEigen(cov, p)

        // Step 4: sort by descending eigenvalue
        const indices = eigenvalues.map((v, i) => i)
        indices.sort((a, b) => eigenvalues[b] - eigenvalues[a])

        const sortedEigenvalues = indices.map(i => eigenvalues[i])
        const sortedComponents = indices.map(i => eigenvectors[i].slice())

        // Step 5: project data onto principal components (scores)
        const scores = []
        for (let i = 0; i < n; i++) {
          const row = new Array(p)
          for (let k = 0; k < p; k++) {
            let val = 0
            for (let j = 0; j < p; j++) {
              val += centered[i][j] * sortedComponents[k][j]
            }
            row[k] = val
          }
          scores.push(row)
        }

        // Step 6: explained variance fractions
        const totalVariance = sortedEigenvalues.reduce((s, v) => s + Math.max(0, v), 0)
        const explainedVariance = sortedEigenvalues.map(v =>
          totalVariance > 0 ? Math.max(0, v) / totalVariance : 0
        )

        return {
          components: sortedComponents,
          eigenvalues: sortedEigenvalues,
          scores,
          explainedVariance
        }
      }
    })

    /**
     * Jacobi eigenvalue algorithm for symmetric matrices.
     * Returns eigenvalues and eigenvectors (as rows).
     * @param {number[][]} A   Symmetric p×p matrix
     * @param {number} p       Matrix dimension
     * @return {{eigenvalues: number[], eigenvectors: number[][]}}
     */
    function jacobiEigen (A, p) {
      // Copy matrix
      const a = A.map(row => row.slice())

      // Initialize eigenvector matrix to identity
      const V = []
      for (let i = 0; i < p; i++) {
        const row = new Array(p).fill(0)
        row[i] = 1
        V.push(row)
      }

      const ITMAX = 100 * p * p
      for (let iter = 0; iter < ITMAX; iter++) {
        // Find off-diagonal element with largest absolute value
        let maxVal = 0
        let row = 0
        let col = 1
        for (let i = 0; i < p - 1; i++) {
          for (let j = i + 1; j < p; j++) {
            if (Math.abs(a[i][j]) > maxVal) {
              maxVal = Math.abs(a[i][j])
              row = i
              col = j
            }
          }
        }

        if (maxVal < 1e-14) break

        // Compute rotation angle
        const theta = 0.5 * Math.atan2(2 * a[row][col], a[row][row] - a[col][col])
        const cosT = Math.cos(theta)
        const sinT = Math.sin(theta)

        // Apply Jacobi rotation
        const newA = a.map(r => r.slice())
        for (let k = 0; k < p; k++) {
          if (k !== row && k !== col) {
            newA[row][k] = cosT * a[row][k] + sinT * a[col][k]
            newA[k][row] = newA[row][k]
            newA[col][k] = -sinT * a[row][k] + cosT * a[col][k]
            newA[k][col] = newA[col][k]
          }
        }
        newA[row][row] = cosT * cosT * a[row][row] + 2 * cosT * sinT * a[row][col] + sinT * sinT * a[col][col]
        newA[col][col] = sinT * sinT * a[row][row] - 2 * cosT * sinT * a[row][col] + cosT * cosT * a[col][col]
        newA[row][col] = 0
        newA[col][row] = 0

        for (let i = 0; i < p; i++) {
          a[i] = newA[i].slice()
        }

        // Update eigenvectors
        for (let k = 0; k < p; k++) {
          const vr = cosT * V[row][k] + sinT * V[col][k]
          const vc = -sinT * V[row][k] + cosT * V[col][k]
          V[row][k] = vr
          V[col][k] = vc
        }
      }

      const eigenvalues = a.map((row, i) => row[i])
      // Eigenvectors are columns of V; return as rows
      const eigenvectors = []
      for (let i = 0; i < p; i++) {
        const evec = new Array(p)
        for (let j = 0; j < p; j++) {
          evec[j] = V[j][i]
        }
        eigenvectors.push(evec)
      }

      return { eigenvalues, eigenvectors }
    }
  }
)
