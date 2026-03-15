import { factory } from '../../utils/factory.ts'
import { createQuantileSeq } from '../../function/statistics/quantileSeq.ts'
import { lastDimToZeroBase } from './utils/lastDimToZeroBase.ts'
import type { TypedFunction, MathFunction, VariadicArgs } from './types.ts'

interface QuantileSeqDependencies {
  typed: TypedFunction
  bignumber: MathFunction
  add: MathFunction
  subtract: MathFunction
  divide: MathFunction
  multiply: MathFunction
  partitionSelect: MathFunction
  compare: MathFunction
  isInteger: (x: unknown) => boolean
  smaller: MathFunction<boolean>
  smallerEq: MathFunction<boolean>
  larger: MathFunction<boolean>
  mapSlices: MathFunction
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
  }: QuantileSeqDependencies) => {
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
        arr: unknown,
        prob: unknown,
        dim: number
      ) => quantileSeq(arr, prob, dimToZeroBase(dim)),
      'Array | Matrix, number | BigNumber, boolean': quantileSeq,
      'Array | Matrix, number | BigNumber, boolean, number': (
        arr: unknown,
        prob: unknown,
        sorted: boolean,
        dim: number
      ) => quantileSeq(arr, prob, sorted, dimToZeroBase(dim)),
      'Array | Matrix, Array | Matrix': quantileSeq,
      'Array | Matrix, Array | Matrix, number': (
        data: unknown,
        prob: unknown,
        dim: number
      ) => quantileSeq(data, prob, dimToZeroBase(dim)),
      'Array | Matrix, Array | Matrix, boolean': quantileSeq,
      'Array | Matrix, Array | Matrix, boolean, number': (
        data: unknown,
        prob: unknown,
        sorted: boolean,
        dim: number
      ) => quantileSeq(data, prob, sorted, dimToZeroBase(dim))
    })

    function dimToZeroBase(dim: number): unknown {
      // TODO: find a better way, maybe lastDimToZeroBase could apply to more cases.
      return (lastDimToZeroBase([[], dim]) as VariadicArgs)[1]
    }
  },
  { isTransformFunction: true }
)
