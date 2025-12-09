import { containsCollections, deepForEach, reduce } from '../../utils/collection.js'
import { factory } from '../../utils/factory.js'
import { safeNumberType } from '../../utils/number.js'
import { improveErrorMessage } from './utils/improveErrorMessage.js'

// Type definitions for statistical operations
interface TypedFunction<T = any> {
  (...args: any[]): T
  find(func: any, signature: string[]): TypedFunction<T>
  convert(value: any, type: string): any
}

interface Matrix {
  valueOf(): any[] | any[][]
}

interface Config {
  number?: string
}

interface Dependencies {
  typed: TypedFunction
  config: Config
  add: TypedFunction
  numeric: TypedFunction
}

const name = 'sum'
const dependencies = ['typed', 'config', 'add', 'numeric']

export const createSum = /* #__PURE__ */ factory(name, dependencies, ({ typed, config, add, numeric }: Dependencies) => {
  /**
   * Compute the sum of a matrix or a list with values.
   * In case of a multidimensional array or matrix, the sum of all
   * elements will be calculated.
   *
   * Syntax:
   *
   *     math.sum(a, b, c, ...)
   *     math.sum(A)
   *     math.sum(A, dimension)
   *
   * Examples:
   *
   *     math.sum(2, 1, 4, 3)               // returns 10
   *     math.sum([2, 1, 4, 3])             // returns 10
   *     math.sum([[2, 5], [4, 3], [1, 7]]) // returns 22
   *
   * See also:
   *
   *    mean, median, min, max, prod, std, variance, cumsum
   *
   * @param {... *} args  A single matrix or multiple scalar values
   * @return {*} The sum of all values
   */
  return typed(name, {
    // sum([a, b, c, d, ...])
    'Array | Matrix': _sum,

    // sum([a, b, c, d, ...], dim)
    'Array | Matrix, number | BigNumber': _nsumDim,

    // sum(a, b, c, d, ...)
    '...': function (args: any[]): any {
      if (containsCollections(args)) {
        throw new TypeError('Scalar values expected in function sum')
      }

      return _sum(args)
    }
  })

  /**
   * Recursively calculate the sum of an n-dimensional array
   * @param {Array | Matrix} array - Input array or matrix
   * @return {number | BigNumber | Complex | Unit} sum
   * @private
   */
  function _sum (array: any[] | Matrix): any {
    let sum: any

    deepForEach(array as any, function (value: any) {
      try {
        sum = (sum === undefined) ? value : add(sum, value)
      } catch (err) {
        throw improveErrorMessage(err, 'sum', value)
      }
    })

    // make sure returning numeric value: parse a string into a numeric value
    if (sum === undefined) {
      sum = numeric(0, config.number)
    }
    if (typeof sum === 'string') {
      sum = numeric(sum, safeNumberType(sum, config as any))
    }

    return sum
  }

  /**
   * Calculate sum along a specified dimension
   * @param {Array | Matrix} array - Input array or matrix
   * @param {number | BigNumber} dim - Dimension to sum along
   * @return {number | BigNumber | Complex | Unit | Array | Matrix} sum
   * @private
   */
  function _nsumDim (array: any[] | Matrix, dim: number | any): any {
    try {
      const sum = reduce(array as any, dim, add)
      return sum
    } catch (err) {
      throw improveErrorMessage(err, 'sum', undefined)
    }
  }
})
