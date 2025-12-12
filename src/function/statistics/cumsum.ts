import { containsCollections } from '../../utils/collection.ts'
import { factory } from '../../utils/factory.ts'
import { _switch } from '../../utils/switch.ts'
import { improveErrorMessage } from './utils/improveErrorMessage.ts'
import { arraySize } from '../../utils/array.ts'
import { IndexError } from '../../error/IndexError.ts'

// Type definitions for statistical operations
interface TypedFunction<T = any> {
  (...args: any[]): T
  find(func: any, signature: string[]): TypedFunction<T>
  convert(value: any, type: string): any
}

interface Matrix {
  create(data: any, datatype?: string): Matrix
  valueOf(): any[] | any[][]
  datatype(): string | undefined
}

interface Dependencies {
  typed: TypedFunction
  add: TypedFunction
  unaryPlus: TypedFunction
}

const name = 'cumsum'
const dependencies = ['typed', 'add', 'unaryPlus']

export const createCumSum = /* #__PURE__ */ factory(name, dependencies, ({ typed, add, unaryPlus }: Dependencies) => {
  /**
   * Compute the cumulative sum of a matrix or a list with values.
   * In case of a (multi dimensional) array or matrix, the cumulative sums
   * along a specified dimension (defaulting to the first) will be calculated.
   *
   * Syntax:
   *
   *     math.cumsum(a, b, c, ...)
   *     math.cumsum(A)
   *
   * Examples:
   *
   *     math.cumsum(2, 1, 4, 3)               // returns [2, 3, 7, 10]
   *     math.cumsum([2, 1, 4, 3])             // returns [2, 3, 7, 10]
   *     math.cumsum([[1, 2], [3, 4]])         // returns [[1, 2], [4, 6]]
   *     math.cumsum([[1, 2], [3, 4]], 0)      // returns [[1, 2], [4, 6]]
   *     math.cumsum([[1, 2], [3, 4]], 1)      // returns [[1, 3], [3, 7]]
   *     math.cumsum([[2, 5], [4, 3], [1, 7]]) // returns [[2, 5], [6, 8], [7, 15]]
   *
   * See also:
   *
   *    mean, median, min, max, prod, std, variance, sum
   *
   * @param {... *} args  A single matrix or or multiple scalar values
   * @return {*} The cumulative sum of all values
   */
  return typed(name, {
    // sum([a, b, c, d, ...])
    Array: _cumsum,
    Matrix: function (matrix: Matrix): Matrix {
      return matrix.create(_cumsum(matrix.valueOf(), matrix.datatype()))
    },

    // sum([a, b, c, d, ...], dim)
    'Array, number | BigNumber': _ncumSumDim,
    'Matrix, number | BigNumber': function (matrix: Matrix, dim: number | any): Matrix {
      return matrix.create(_ncumSumDim(matrix.valueOf(), dim), matrix.datatype())
    },

    // cumsum(a, b, c, d, ...)
    '...': function (args: any[]): any {
      if (containsCollections(args)) {
        throw new TypeError('All values expected to be scalar in function cumsum')
      }

      return _cumsum(args)
    }
  })

  /**
     * Recursively calculate the cumulative sum of an n-dimensional array
     * @param {Array} array - Input array
     * @param {string} [datatype] - Optional datatype
     * @return {Array} cumsum
     * @private
     */
  function _cumsum (array: any[], datatype?: string): any[] {
    try {
      return _cumsummap(array)
    } catch (err) {
      throw improveErrorMessage(err, name, undefined)
    }
  }

  /**
   * Map cumulative sum over an array
   * @param {Array} array - Input array
   * @return {Array} cumulative sums
   * @private
   */
  function _cumsummap (array: any[]): any[] {
    if (array.length === 0) {
      return []
    }

    const sums = [unaryPlus(array[0])] // unaryPlus converts to number if need be
    for (let i = 1; i < array.length; ++i) {
      // Must use add below and not addScalar for the case of summing a
      // 2+-dimensional array along the 0th dimension (the row vectors,
      // or higher-d analogues, are literally added to each other).
      sums.push(add(sums[i - 1], array[i]))
    }
    return sums
  }

  /**
   * Calculate cumulative sum along a specified dimension
   * @param {Array} array - Input array
   * @param {number | BigNumber} dim - Dimension
   * @return {Array} cumulative sums
   * @private
   */
  function _ncumSumDim (array: any[], dim: number | any): any[] {
    const size = arraySize(array)
    if (dim < 0 || (dim >= size.length)) {
      // TODO: would be more clear when throwing a DimensionError here
      throw new IndexError(dim, 0, size.length) as any
    }

    try {
      return _cumsumDimensional(array, dim)
    } catch (err) {
      throw improveErrorMessage(err, name, undefined)
    }
  }

  /* Possible TODO: Refactor _reduce in collection.js to be able to work here as well */
  /**
   * Calculate cumulative sum along a dimension recursively
   * @param {Array} mat - Input matrix
   * @param {number} dim - Dimension
   * @return {Array} cumulative sums
   * @private
   */
  function _cumsumDimensional (mat: any[], dim: number): any[] {
    let i: number
    let ret: any[]
    let tran: any[]

    if (dim <= 0) {
      const initialValue = mat[0][0]
      if (!Array.isArray(initialValue)) {
        return _cumsummap(mat)
      } else {
        tran = _switch(mat)
        ret = []
        for (i = 0; i < tran.length; i++) {
          ret[i] = _cumsumDimensional(tran[i], dim - 1)
        }
        return ret
      }
    } else {
      ret = []
      for (i = 0; i < mat.length; i++) {
        ret[i] = _cumsumDimensional(mat[i], dim - 1)
      }
      return ret
    }
  }
})
