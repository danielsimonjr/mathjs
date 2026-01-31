import { isNumber, isBigNumber } from '../../utils/is.ts'
import { flatten } from '../../utils/array.ts'
import { factory } from '../../utils/factory.ts'
import type { TypedFunction } from '../../core/function/typed.ts'

// Type definitions for quantileSeq
interface MatrixType {
  valueOf(): unknown[] | unknown[][]
}

interface BigNumberType {
  times(n: number): BigNumberType
  floor(): BigNumberType
  toNumber(): number
  minus(n: number | BigNumberType): BigNumberType
  valueOf(): number
}

interface QuantileSeqDependencies {
  typed: TypedFunction
  bignumber?: (value: unknown) => BigNumberType
  add: TypedFunction
  subtract: TypedFunction
  divide: (a: unknown, b: unknown) => number | BigNumberType
  multiply: TypedFunction
  partitionSelect: TypedFunction
  compare: (a: unknown, b: unknown) => number
  isInteger: TypedFunction
  smaller: (a: unknown, b: unknown) => boolean
  smallerEq: (a: unknown, b: unknown) => boolean
  larger: (a: unknown, b: unknown) => boolean
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
  }: QuantileSeqDependencies) => {
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
        data: unknown[] | MatrixType,
        p: number | BigNumberType
      ): unknown => _quantileSeqProbNumber(data, p, false),
      'Array | Matrix, number | BigNumber, number': (
        data: unknown[] | MatrixType,
        prob: number | BigNumberType,
        dim: number
      ): unknown => _quantileSeqDim(data, prob, false, dim, _quantileSeqProbNumber),
      'Array | Matrix, number | BigNumber, boolean': _quantileSeqProbNumber,
      'Array | Matrix, number | BigNumber, boolean, number': (
        data: unknown[] | MatrixType,
        prob: number | BigNumberType,
        sorted: boolean,
        dim: number
      ): unknown =>
        _quantileSeqDim(data, prob, sorted, dim, _quantileSeqProbNumber),
      'Array | Matrix, Array | Matrix': (
        data: unknown[] | MatrixType,
        p: unknown[] | MatrixType
      ): unknown => _quantileSeqProbCollection(data, p, false),
      'Array | Matrix, Array | Matrix, number': (
        data: unknown[] | MatrixType,
        prob: unknown[] | MatrixType,
        dim: number
      ): unknown =>
        _quantileSeqDim(data, prob, false, dim, _quantileSeqProbCollection),
      'Array | Matrix, Array | Matrix, boolean': _quantileSeqProbCollection,
      'Array | Matrix, Array | Matrix, boolean, number': (
        data: unknown[] | MatrixType,
        prob: unknown[] | MatrixType,
        sorted: boolean,
        dim: number
      ): unknown =>
        _quantileSeqDim(data, prob, sorted, dim, _quantileSeqProbCollection)
    })

    function _quantileSeqDim<T>(
      data: unknown[] | MatrixType,
      prob: T,
      sorted: boolean,
      dim: number,
      fn: (data: unknown[] | MatrixType, prob: T, sorted: boolean) => unknown
    ): unknown {
      return mapSlices(data, dim, (x: unknown) => fn(x as unknown[] | MatrixType, prob, sorted))
    }

    function _quantileSeqProbNumber(
      data: unknown[] | MatrixType,
      probOrN: number | BigNumberType,
      sorted: boolean
    ): unknown {
      let probArr: unknown[]
      const dataArr = (data as MatrixType).valueOf() as unknown[]
      if (smaller(probOrN, 0)) {
        throw new Error('N/prob must be non-negative')
      }
      if (smallerEq(probOrN, 1)) {
        // quantileSeq([a, b, c, d, ...], prob[,sorted])
        return isNumber(probOrN)
          ? _quantileSeq(dataArr, probOrN, sorted)
          : bignumber!(_quantileSeq(dataArr, probOrN, sorted))
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

        return isNumber(probOrN) ? probArr : bignumber!(probArr)
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
      data: unknown[] | MatrixType,
      probOrN: unknown[] | MatrixType,
      sorted: boolean
    ): unknown {
      const dataArr = (data as MatrixType).valueOf() as unknown[]
      // quantileSeq([a, b, c, d, ...], [prob1, prob2, ...][,sorted])
      const probOrNArr = (probOrN as MatrixType).valueOf() as unknown[]
      const probArr: unknown[] = []
      for (let i = 0; i < probOrNArr.length; ++i) {
        probArr.push(_quantileSeq(dataArr, probOrNArr[i] as number | BigNumberType, sorted))
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
      array: unknown[],
      prob: number | BigNumberType,
      sorted: boolean
    ): unknown {
      const flat = flatten(array) as unknown[]
      const len = flat.length
      if (len === 0) {
        throw new Error('Cannot calculate quantile of an empty sequence')
      }

      const index = isNumber(prob) ? prob * (len - 1) : (prob as BigNumberType).times(len - 1)
      const integerPart = isNumber(prob)
        ? Math.floor(index as number)
        : (index as BigNumberType).floor().toNumber()
      const fracPart = isNumber(prob) ? (index as number) % 1 : (index as BigNumberType).minus(integerPart)

      if (isInteger(index)) {
        return sorted
          ? flat[index as number]
          : partitionSelect(flat, isNumber(prob) ? index : (index as BigNumberType).valueOf())
      }
      let left: unknown
      let right: unknown
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
      // If left/right are BigNumbers but fracPart is a number, convert to BigNumber
      // to avoid floating-point precision errors
      const fracPartConverted =
        isBigNumber(left) && isNumber(fracPart)
          ? bignumber!(fracPart)
          : fracPart
      return add(
        multiply(left, subtract(1, fracPartConverted)),
        multiply(right, fracPartConverted)
      )
    }
  }
)
