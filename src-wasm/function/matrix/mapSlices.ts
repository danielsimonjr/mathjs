import { factory } from '../../utils/factory.ts'
import { arraySize } from '../../utils/array.ts'
import { isMatrix } from '../../utils/is.ts'
import { IndexError } from '../../error/IndexError.ts'

import { TypedFunction, Matrix, BigNumber } from '../../types.ts'

const name = 'mapSlices'
const dependencies = ['typed', 'isInteger']

export const createMapSlices = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({
    typed,
    isInteger
  }: {
    typed: TypedFunction
    isInteger: (value: any) => boolean
  }): TypedFunction => {
    /**
     * Apply a function that maps an array to a scalar
     * along a given axis of a matrix or array.
     * Returns a new matrix or array with one less dimension than the input.
     *
     * Syntax:
     *
     *     math.mapSlices(A, dim, callback)
     *
     * Where:
     *
     * - `dim: number` is a zero-based dimension over which to concatenate the matrices.
     *
     * Examples:
     *
     *    const A = [[1, 2], [3, 4]]
     *    const sum = math.sum
     *
     *    math.mapSlices(A, 0, sum)             // returns [4, 6]
     *    math.mapSlices(A, 1, sum)             // returns [3, 7]
     *
     * See also:
     *
     *    map, filter, forEach
     *
     * Note:
     *
     *    `mapSlices()` is also currently available via its deprecated
     *    synonym `apply()`.
     *
     * @param {Array | Matrix} array   The input Matrix
     * @param {number} dim             The dimension along which the callback is applied
     * @param {Function} callback      The callback function that is applied. This Function
     *                                 should take an array or 1-d matrix as an input and
     *                                 return a number.
     * @return {Array | Matrix} res    The residual matrix with the function mapped on the slices over some dimension.
     */
    return typed(name, {
      'Array | Matrix, number | BigNumber, function': function (
        mat: any[] | Matrix,
        dim: number | BigNumber,
        callback: Function
      ) {
        if (!isInteger(dim)) {
          throw new TypeError('Integer number expected for dimension')
        }

        const dimNum = typeof dim === 'number' ? dim : (dim as any).toNumber()
        const size = Array.isArray(mat) ? arraySize(mat) : (mat as any).size()
        if (dimNum < 0 || dimNum >= size.length) {
          throw new IndexError(dimNum, 0, size.length) as any
        }

        if (isMatrix(mat)) {
          return (mat as any).create(
            _mapSlices((mat as any).valueOf(), dimNum, callback),
            (mat as any).datatype()
          )
        } else {
          return _mapSlices(mat, dimNum, callback)
        }
      }
    })
  },
  { formerly: 'apply' }
)

/**
 * Recursively reduce a matrix
 * @param {Array} mat
 * @param {number} dim
 * @param {Function} callback
 * @returns {Array} ret
 * @private
 */
function _mapSlices(mat: any, dim: any, callback: any): any {
  let i, ret, tran

  if (dim <= 0) {
    if (!Array.isArray(mat[0])) {
      return callback(mat)
    } else {
      tran = _switch(mat)
      ret = []
      for (i = 0; i < tran.length; i++) {
        ret[i] = _mapSlices(tran[i], dim - 1, callback)
      }
      return ret
    }
  } else {
    ret = []
    for (i = 0; i < mat.length; i++) {
      ret[i] = _mapSlices(mat[i], dim - 1, callback)
    }
    return ret
  }
}

/**
 * Transpose a matrix
 * @param {Array} mat
 * @returns {Array} ret
 * @private
 */
function _switch(mat: any) {
  const I = mat.length
  const J = mat[0].length
  let i, j
  const ret = []
  for (j = 0; j < J; j++) {
    const tmp = []
    for (i = 0; i < I; i++) {
      tmp.push(mat[i][j])
    }
    ret.push(tmp)
  }
  return ret
}
