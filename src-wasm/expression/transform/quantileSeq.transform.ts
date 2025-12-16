import { factory } from '../../utils/factory.ts'
import { createQuantileSeq } from '../../function/statistics/quantileSeq.ts'
import { lastDimToZeroBase } from './utils/lastDimToZeroBase.ts'

interface TypedFunction<T = any> {
  (...args: any[]): T
}

interface Dependencies {
  typed: TypedFunction
  bignumber: (...args: any[]) => any
  add: (...args: any[]) => any
  subtract: (...args: any[]) => any
  divide: (...args: any[]) => any
  multiply: (...args: any[]) => any
  partitionSelect: (...args: any[]) => any
  compare: (...args: any[]) => any
  isInteger: (x: any) => boolean
  smaller: (...args: any[]) => any
  smallerEq: (...args: any[]) => any
  larger: (...args: any[]) => any
  mapSlices: (...args: any[]) => any
}

const name = 'quantileSeq'
const dependencies = [
  'typed',
  'bignumber',
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

/**
 * Attach a transform function to math.quantileSeq
 * Adds a property transform containing the transform function.
 *
 * This transform changed the `dim` parameter of function std
 * from one-based to zero based
 */
export const createQuantileSeqTransform = /* #__PURE__ */ factory(
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
    const quantileSeq = createQuantileSeq({
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
    })

    return typed('quantileSeq', {
      'Array | Matrix, number | BigNumber': quantileSeq,
      'Array | Matrix, number | BigNumber, number': (
        arr: any,
        prob: any,
        dim: number
      ) => quantileSeq(arr, prob, dimToZeroBase(dim)),
      'Array | Matrix, number | BigNumber, boolean': quantileSeq,
      'Array | Matrix, number | BigNumber, boolean, number': (
        arr: any,
        prob: any,
        sorted: boolean,
        dim: number
      ) => quantileSeq(arr, prob, sorted, dimToZeroBase(dim)),
      'Array | Matrix, Array | Matrix': quantileSeq,
      'Array | Matrix, Array | Matrix, number': (
        data: any,
        prob: any,
        dim: number
      ) => quantileSeq(data, prob, dimToZeroBase(dim)),
      'Array | Matrix, Array | Matrix, boolean': quantileSeq,
      'Array | Matrix, Array | Matrix, boolean, number': (
        data: any,
        prob: any,
        sorted: boolean,
        dim: number
      ) => quantileSeq(data, prob, sorted, dimToZeroBase(dim))
    })

    function dimToZeroBase(dim: number): any {
      // TODO: find a better way, maybe lastDimToZeroBase could apply to more cases.
      return lastDimToZeroBase([[], dim])[1]
    }
  },
  { isTransformFunction: true }
)
