import { factory } from '../../utils/factory.js'

const name = 'griddata'
const dependencies = ['typed']

export const createGriddata = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }) => {
    /**
     * Interpolate scattered data at new query points.
     *
     * Supports three interpolation methods:
     * - 'nearest': nearest-neighbor (0th order)
     * - 'linear': inverse distance weighting (IDW, Shepard's method)
     * - 'natural': same as 'linear' with a distance exponent of 2
     *
     * Works in any dimension. Points are arrays of coordinates.
     *
     * Syntax:
     *
     *    math.griddata(points, values, xi)
     *    math.griddata(points, values, xi, method)
     *
     * Examples:
     *
     *    math.griddata([[0,0],[1,0],[0,1],[1,1]], [0,1,1,2], [[0.5,0.5]])
     *    math.griddata([[0],[1],[2]], [0,1,4], [[0.5],[1.5]], 'nearest')
     *
     * See also:
     *
     *    interpolate, rbfInterpolate, cspline
     *
     * @param {Array}  points  Scattered data points (N x d array)
     * @param {Array}  values  Function values at data points (length N)
     * @param {Array}  xi      Query points (M x d array)
     * @param {string} [method='linear'] Interpolation method:
     *                 'nearest', 'linear', or 'natural'
     * @return {Array}  Interpolated values at xi (length M)
     */
    return typed(name, {
      'Array, Array, Array': function (points, values, xi) {
        return _griddata(points, values, xi, 'linear')
      },
      'Array, Array, Array, string': function (points, values, xi, method) {
        return _griddata(points, values, xi, method)
      }
    })

    function _dist2 (a, b) {
      let sum = 0
      for (let i = 0; i < a.length; i++) {
        const diff = a[i] - b[i]
        sum += diff * diff
      }
      return sum
    }

    function _griddata (points, values, xi, method) {
      const n = points.length
      const m = xi.length

      if (n !== values.length) {
        throw new Error('griddata: points and values must have the same length')
      }
      if (n === 0) {
        throw new Error('griddata: at least one data point is required')
      }

      const validMethods = ['nearest', 'linear', 'natural']
      if (!validMethods.includes(method)) {
        throw new Error('griddata: unknown method "' + method + '". Use nearest, linear, or natural.')
      }

      const result = new Array(m)

      for (let q = 0; q < m; q++) {
        const xq = xi[q]

        if (method === 'nearest') {
          // Nearest-neighbor: find the closest data point
          let minDist2 = Infinity
          let nearest = 0
          for (let i = 0; i < n; i++) {
            const d2 = _dist2(xq, points[i])
            if (d2 < minDist2) {
              minDist2 = d2
              nearest = i
            }
          }
          result[q] = values[nearest]
        } else {
          // Inverse distance weighting (Shepard's method)
          // 'linear' uses p=1, 'natural' uses p=2
          const p = method === 'natural' ? 2 : 1

          // Check for exact hit
          let exactHit = -1
          for (let i = 0; i < n; i++) {
            if (_dist2(xq, points[i]) < 1e-28) {
              exactHit = i
              break
            }
          }
          if (exactHit >= 0) {
            result[q] = values[exactHit]
            continue
          }

          let weightSum = 0
          let valueSum = 0
          for (let i = 0; i < n; i++) {
            const d2 = _dist2(xq, points[i])
            const w = p === 1 ? 1 / Math.sqrt(d2) : 1 / d2
            weightSum += w
            valueSum += w * values[i]
          }
          result[q] = valueSum / weightSum
        }
      }

      return result
    }
  }
)
