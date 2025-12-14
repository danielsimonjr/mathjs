import { isNumber } from '../../utils/is.ts'
import { flatten } from '../../utils/array.ts'
import { factory } from '../../utils/factory.ts'

// Type definitions for statistical operations
interface TypedFunction<T = any> {
  (...args: any[]): T
  find(func: any, signature: string[]): TypedFunction<T>
  convert(value: any, type: string): any
}

interface Matrix {
  valueOf(): any[] | any[][]
}

interface Dependencies {
  typed: TypedFunction
  bignumber?: TypedFunction
  add: TypedFunction
  subtract: TypedFunction
  divide: TypedFunction
  multiply: TypedFunction
  partitionSelect: TypedFunction
  compare: TypedFunction
  isInteger: TypedFunction
  smaller: TypedFunction
  smallerEq: TypedFunction
  larger: TypedFunction
  mapSlices: TypedFunction
}

const name = 'quantileSeq'
const dependencies = [
  'typed',
  '?bignumber',
  'add',
  'subtract',
  'divide',
  'multiply',
  'partitionSelect',
  'compare',
  'isInteger',
  'smaller',
  'smallerEq',
  'larger',
  'mapSlices'
]

export const createQuantileSeq = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({
    typed,
    bignumber,
    add,
    subtract,
    divide,
    multiply,
    partitionSelect,
    compare,
    isInteger,
    smaller,
    smallerEq,
    larger,
    mapSlices
  }: Dependencies) => {
    /**
     * Compute the prob order quantile of a matrix or a list with values.
     * The sequence is sorted and the middle value is returned.
     * Supported types of sequence values are: Number, BigNumber, Unit
     * Supported types of probability are: Number, BigNumber
     *
     * In case of a multidimensional array or matrix, the prob order quantile
     * of all elements will be calculated.
     *
     * Syntax:
     *
     *     math.quantileSeq(A, prob[, sorted])
     *     math.quantileSeq(A, [prob1, prob2, ...][, sorted])
     *     math.quantileSeq(A, N[, sorted])
     *
     * Examples:
     *
     *     math.quantileSeq([3, -1, 5, 7], 0.5)         // returns 4
     *     math.quantileSeq([3, -1, 5, 7], [1/3, 2/3])  // returns [3, 5]
     *     math.quantileSeq([3, -1, 5, 7], 2)           // returns [3, 5]
     *     math.quantileSeq([-1, 3, 5, 7], 0.5, true)   // returns 4
     *
     * See also:
     *
     *     median, mean, min, max, sum, prod, std, variance
     *
     * @param {Array, Matrix} data                A single matrix or Array
     * @param {Number, BigNumber, Array} probOrN  prob is the order of the quantile, while N is
     *                                            the amount of evenly distributed steps of
     *                                            probabilities; only one of these options can
     *                                            be provided
     * @param {Boolean} sorted=false              is data sorted in ascending order
     * @return {Number, BigNumber, Unit, Array}   Quantile(s)
     */
    return typed(name, {
      'Array | Matrix, number | BigNumber': (
        data: any[] | Matrix,
        p: number | any
      ): any => _quantileSeqProbNumber(data, p, false),
      'Array | Matrix, number | BigNumber, number': (
        data: any[] | Matrix,
        prob: number | any,
        dim: number
      ): any => _quantileSeqDim(data, prob, false, dim, _quantileSeqProbNumber),
      'Array | Matrix, number | BigNumber, boolean': _quantileSeqProbNumber,
      'Array | Matrix, number | BigNumber, boolean, number': (
        data: any[] | Matrix,
        prob: number | any,
        sorted: boolean,
        dim: number
      ): any =>
        _quantileSeqDim(data, prob, sorted, dim, _quantileSeqProbNumber),
      'Array | Matrix, Array | Matrix': (
        data: any[] | Matrix,
        p: any[] | Matrix
      ): any => _quantileSeqProbCollection(data, p, false),
      'Array | Matrix, Array | Matrix, number': (
        data: any[] | Matrix,
        prob: any[] | Matrix,
        dim: number
      ): any =>
        _quantileSeqDim(data, prob, false, dim, _quantileSeqProbCollection),
      'Array | Matrix, Array | Matrix, boolean': _quantileSeqProbCollection,
      'Array | Matrix, Array | Matrix, boolean, number': (
        data: any[] | Matrix,
        prob: any[] | Matrix,
        sorted: boolean,
        dim: number
      ): any =>
        _quantileSeqDim(data, prob, sorted, dim, _quantileSeqProbCollection)
    })

    function _quantileSeqDim(
      data: any[] | Matrix,
      prob: any,
      sorted: boolean,
      dim: number,
      fn: Function
    ): any {
      return mapSlices(data, dim, (x: any) => fn(x, prob, sorted))
    }

    function _quantileSeqProbNumber(
      data: any[] | Matrix,
      probOrN: number | any,
      sorted: boolean
    ): any {
      let probArr: any[]
      const dataArr = (data as any).valueOf() as any[]
      if (smaller(probOrN, 0)) {
        throw new Error('N/prob must be non-negative')
      }
      if (smallerEq(probOrN, 1)) {
        // quantileSeq([a, b, c, d, ...], prob[,sorted])
        return isNumber(probOrN)
          ? _quantileSeq(dataArr, probOrN, sorted)
          : bignumber!(_quantileSeq(dataArr, probOrN, sorted) as any)
      }
      if (larger(probOrN, 1)) {
        // quantileSeq([a, b, c, d, ...], N[,sorted])
        if (!isInteger(probOrN)) {
          throw new Error('N must be a positive integer')
        }

        // largest possible Array length is 2^32-1
        // 2^32 < 10^15, thus safe conversion guaranteed
        if (larger(probOrN, 4294967295)) {
          throw new Error(
            'N must be less than or equal to 2^32-1, as that is the maximum length of an Array'
          )
        }

        const nPlusOne = add(probOrN, 1)
        probArr = []

        for (let i = 0; smaller(i, probOrN); i++) {
          const prob = divide(i + 1, nPlusOne)
          probArr.push(_quantileSeq(dataArr, prob, sorted))
        }

        return isNumber(probOrN) ? probArr : bignumber!(probArr as any)
      }
    }

    /**
     * Calculate the prob order quantile of an n-dimensional array.
     *
     * @param {Array | Matrix} array - Input data
     * @param {Array | Matrix} prob - Probabilities
     * @param {Boolean} sorted - Is data sorted
     * @return {Number, BigNumber, Unit} prob order quantile
     * @private
     */

    function _quantileSeqProbCollection(
      data: any[] | Matrix,
      probOrN: any[] | Matrix,
      sorted: boolean
    ): any {
      const dataArr = (data as any).valueOf() as any[]
      // quantileSeq([a, b, c, d, ...], [prob1, prob2, ...][,sorted])
      const probOrNArr = (probOrN as any).valueOf() as any[]
      const probArr: any[] = []
      for (let i = 0; i < probOrNArr.length; ++i) {
        probArr.push(_quantileSeq(dataArr, probOrNArr[i], sorted))
      }
      return probArr
    }

    /**
     * Calculate the prob order quantile of an n-dimensional array.
     *
     * @param {Array} array - Input array
     * @param {Number | BigNumber} prob - Probability
     * @param {Boolean} sorted - Is data sorted
     * @return {Number, BigNumber, Unit} prob order quantile
     * @private
     */
    function _quantileSeq(
      array: any[],
      prob: number | any,
      sorted: boolean
    ): any {
      const flat = flatten(array)
      const len = flat.length
      if (len === 0) {
        throw new Error('Cannot calculate quantile of an empty sequence')
      }

      const index = isNumber(prob) ? prob * (len - 1) : prob.times(len - 1)
      const integerPart = isNumber(prob)
        ? Math.floor(index)
        : index.floor().toNumber()
      const fracPart = isNumber(prob) ? index % 1 : index.minus(integerPart)

      if (isInteger(index)) {
        return sorted
          ? flat[index]
          : partitionSelect(flat, isNumber(prob) ? index : index.valueOf())
      }
      let left: any
      let right: any
      if (sorted) {
        left = flat[integerPart]
        right = flat[integerPart + 1]
      } else {
        right = partitionSelect(flat, integerPart + 1)

        // max of partition is kth largest
        left = flat[integerPart]
        for (let i = 0; i < integerPart; ++i) {
          if (compare(flat[i], left) > 0) {
            left = flat[i]
          }
        }
      }
      // Q(prob) = (1-f)*A[floor(index)] + f*A[floor(index)+1]
      return add(
        multiply(left, subtract(1, fracPart)),
        multiply(right, fracPart)
      )
    }
  }
)
