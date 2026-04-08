import { factory } from '../../utils/factory.js'

const name = 'rbfInterpolate'
const dependencies = ['typed']

export const createRbfInterpolate = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }) => {
    /**
     * Radial Basis Function (RBF) interpolation for scattered data in any dimension.
     *
     * Fits a function of the form:
     *   f(x) = sum_i w_i * phi(||x - x_i||)
     * where phi is the chosen radial basis function. Solves a linear system
     * for the weights w_i and returns an evaluator.
     *
     * Syntax:
     *
     *    math.rbfInterpolate(points, values, kernel)
     *
     * Examples:
     *
     *    const rbf = math.rbfInterpolate([[0],[1],[2]], [0,1,4], 'gaussian')
     *    rbf.evaluate([1.5])
     *    math.rbfInterpolate([[0,0],[1,0],[0,1]], [0,1,1], 'multiquadric').evaluate([0.5,0.5])
     *
     * See also:
     *
     *    interpolate, cspline, griddata
     *
     * @param {Array}  points  Array of N coordinate arrays (each has same dimension d)
     * @param {Array}  values  Array of N function values at the corresponding points
     * @param {string} kernel  Kernel type: 'gaussian', 'multiquadric',
     *                         'inverseMultiquadric', or 'thinPlateSpline'
     * @return {Object}  Object with `evaluate(point)` method
     */
    return typed(name, {
      'Array, Array, string': function (points, values, kernel) {
        return _buildRbf(points, values, kernel)
      }
    })

    function _kernelFn (type) {
      switch (type) {
        case 'gaussian':
          return (r) => Math.exp(-(r * r))
        case 'multiquadric':
          return (r) => Math.sqrt(r * r + 1)
        case 'inverseMultiquadric':
          return (r) => 1 / Math.sqrt(r * r + 1)
        case 'thinPlateSpline':
          return (r) => {
            if (r === 0) return 0
            return r * r * Math.log(r)
          }
        default:
          throw new Error(
            'rbfInterpolate: unknown kernel "' + type +
            '". Use gaussian, multiquadric, inverseMultiquadric, or thinPlateSpline.'
          )
      }
    }

    function _dist (a, b) {
      let sum = 0
      for (let i = 0; i < a.length; i++) {
        const diff = a[i] - b[i]
        sum += diff * diff
      }
      return Math.sqrt(sum)
    }

    function _buildRbf (points, values, kernel) {
      const n = points.length

      if (n !== values.length) {
        throw new Error('rbfInterpolate: points and values must have the same length')
      }
      if (n === 0) {
        throw new Error('rbfInterpolate: at least one point is required')
      }

      const phi = _kernelFn(kernel)

      // Build the RBF matrix A where A[i][j] = phi(||x_i - x_j||)
      const A = []
      for (let i = 0; i < n; i++) {
        A.push(new Array(n))
        for (let j = 0; j < n; j++) {
          A[i][j] = phi(_dist(points[i], points[j]))
        }
      }

      // Solve A * w = values using Gaussian elimination with partial pivoting
      const w = _solveLinear(A, values.slice())

      return {
        evaluate: function (point) {
          let result = 0
          for (let i = 0; i < n; i++) {
            result += w[i] * phi(_dist(point, points[i]))
          }
          return result
        }
      }
    }

    function _solveLinear (A, b) {
      const n = A.length
      // Augmented matrix
      const M = A.map((row, i) => row.slice().concat([b[i]]))

      for (let col = 0; col < n; col++) {
        // Partial pivoting
        let maxRow = col
        let maxVal = Math.abs(M[col][col])
        for (let row = col + 1; row < n; row++) {
          if (Math.abs(M[row][col]) > maxVal) {
            maxVal = Math.abs(M[row][col])
            maxRow = row
          }
        }
        const tmp = M[col]; M[col] = M[maxRow]; M[maxRow] = tmp

        if (Math.abs(M[col][col]) < 1e-14) {
          throw new Error('rbfInterpolate: RBF matrix is singular or nearly singular')
        }

        const pivot = M[col][col]
        for (let j = col; j <= n; j++) {
          M[col][j] /= pivot
        }
        for (let row = 0; row < n; row++) {
          if (row !== col) {
            const factor = M[row][col]
            for (let j = col; j <= n; j++) {
              M[row][j] -= factor * M[col][j]
            }
          }
        }
      }

      return M.map(row => row[n])
    }
  }
)
