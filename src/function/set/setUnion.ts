import { flatten } from '../../utils/array.ts'
import { factory } from '../../utils/factory.ts'
import type {
  MathArray,
  Matrix,
  MathNumericType
} from '../../../types/index.ts'
import type { TypedFunction } from '../../core/function/typed.ts'

// Type definitions for setUnion
interface Index {
  // Index placeholder
}

interface SetUnionDependencies {
  typed: TypedFunction
  size: (arr: MathArray | Matrix) => number[]
  concat: TypedFunction
  subset: (arr: number[], index: Index) => number
  setIntersect: (
    a1: MathNumericType[],
    a2: MathNumericType[]
  ) => MathNumericType[]
  setSymDifference: (
    a1: MathNumericType[],
    a2: MathNumericType[]
  ) => MathNumericType[]
  Index: new (i: number) => Index
}

const name = 'setUnion'
const dependencies = [
  'typed',
  'size',
  'concat',
  'subset',
  'setIntersect',
  'setSymDifference',
  'Index'
]

export const createSetUnion = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({
    typed,
    size,
    concat,
    subset,
    setIntersect,
    setSymDifference,
    Index
  }: SetUnionDependencies) => {
    /**
     * Create the union of two (multi)sets.
     * Multi-dimension arrays will be converted to single-dimension arrays before the operation.
     *
     * Syntax:
     *
     *    math.setUnion(set1, set2)
     *
     * Examples:
     *
     *    math.setUnion([1, 2, 3, 4], [3, 4, 5, 6])            // returns [1, 2, 3, 4, 5, 6]
     *    math.setUnion([[1, 2], [3, 4]], [[3, 4], [5, 6]])    // returns [1, 2, 3, 4, 5, 6]
     *
     * See also:
     *
     *    setIntersect, setDifference
     *
     * @param {Array | Matrix}    a1  A (multi)set
     * @param {Array | Matrix}    a2  A (multi)set
     * @return {Array | Matrix}    The union of two (multi)sets
     */
    return typed(name, {
      'Array | Matrix, Array | Matrix': function (
        a1: MathArray | Matrix,
        a2: MathArray | Matrix
      ): MathNumericType[] | Matrix {
        if (subset(size(a1), new Index(0)) === 0) {
          // if any of them is empty, return the other one
          return flatten(a2 as MathNumericType[])
        } else if (subset(size(a2), new Index(0)) === 0) {
          return flatten(a1 as MathNumericType[])
        }
        const b1 = flatten(a1 as MathNumericType[])
        const b2 = flatten(a2 as MathNumericType[])
        return concat(setSymDifference(b1, b2), setIntersect(b1, b2))
      }
    })
  }
)
