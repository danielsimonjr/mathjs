import { factory } from '../../utils/factory.ts'
import { createMatAlgo03xDSf } from '../../type/matrix/utils/matAlgo03xDSf.ts'
import { createMatAlgo14xDs } from '../../type/matrix/utils/matAlgo14xDs.ts'
import { createMatAlgo13xDD } from '../../type/matrix/utils/matAlgo13xDD.ts'
import { DimensionError } from '../../error/DimensionError.ts'

import {
  TypedFunction,
  Matrix,
  SparseMatrix,
  MatrixConstructor,
  Complex,
  BigNumber,
  Fraction,
  Unit
} from '../../types.ts'

// Type definitions for nullish operation
interface DenseMatrix extends Matrix {
  type: 'DenseMatrix'
  valueOf(): unknown[][]
}

interface NullishDependencies {
  typed: TypedFunction
  matrix: MatrixConstructor
  size: TypedFunction
  flatten: TypedFunction
  deepEqual: TypedFunction
}

type NullishScalarType =
  | number
  | bigint
  | Complex
  | BigNumber
  | Fraction
  | Unit
  | string
  | boolean
  | SparseMatrix

const name = 'nullish'
const dependencies = ['typed', 'matrix', 'size', 'flatten', 'deepEqual']

export const createNullish = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({
    typed,
    matrix,
    size,
    flatten: _flatten,
    deepEqual
  }: NullishDependencies): TypedFunction => {
    const matAlgo03xDSf = createMatAlgo03xDSf({ typed })
    const matAlgo14xDs = createMatAlgo14xDs({ typed })
    const matAlgo13xDD = createMatAlgo13xDD({ typed })

    /**
     * Nullish coalescing operator (??). Returns the right-hand side operand
     * when the left-hand side operand is null or undefined, and otherwise
     * returns the left-hand side operand.
     *
     * For matrices, the function is evaluated element wise.
     *
     * Syntax:
     *
     *    math.nullish(x, y)
     *
     * Examples:
     *
     *    math.nullish(null, 42)        // returns 42
     *    math.nullish(undefined, 42)   // returns 42
     *    math.nullish(0, 42)           // returns 0
     *    math.nullish(false, 42)       // returns false
     *    math.nullish('', 42)          // returns ''
     *
     *    // Object property access with fallback
     *    const obj = {foo: 7, bar: 3}
     *    math.nullish(obj.baz, 0)      // returns 0
     *
     * See also:
     *
     *    and, or, not
     *
     * @param  {*} x First value to check
     * @param  {*} y Fallback value
     * @return {*} Returns y when x is null or undefined, otherwise returns x
     */

    // Helper function to create matrix from array
    const toMatrix = (arr: unknown[]): DenseMatrix => {
      return (matrix as unknown as (data: unknown[]) => DenseMatrix)(arr)
    }

    return typed(name, {
      // Scalar and SparseMatrix-first short-circuit handlers
      'number|bigint|Complex|BigNumber|Fraction|Unit|string|boolean|SparseMatrix, any':
        (x: NullishScalarType, _y: unknown): NullishScalarType => x,
      'null, any': (_x: null, y: unknown): unknown => y,
      'undefined, any': (_x: undefined, y: unknown): unknown => y,

      // SparseMatrix-first with collection RHS: enforce exact shape match
      'SparseMatrix, Array | Matrix': (
        x: SparseMatrix,
        y: unknown[] | Matrix
      ): SparseMatrix => {
        const sx = size(x)
        const sy = size(y)
        if (deepEqual(sx, sy)) return x
        throw new DimensionError(sx, sy)
      },

      // DenseMatrix-first handlers (no broadcasting between collections)
      'DenseMatrix, DenseMatrix': typed.referToSelf(
        (self: TypedFunction) =>
          (x: DenseMatrix, y: DenseMatrix): DenseMatrix =>
            matAlgo13xDD(x, y, self)
      ),
      'DenseMatrix, SparseMatrix': typed.referToSelf(
        (self: TypedFunction) =>
          (x: DenseMatrix, y: SparseMatrix): DenseMatrix =>
            matAlgo03xDSf(x, y, self, false)
      ),
      'DenseMatrix, Array': typed.referToSelf(
        (self: TypedFunction) =>
          (x: DenseMatrix, y: unknown[]): DenseMatrix =>
            matAlgo13xDD(x, toMatrix(y), self)
      ),
      'DenseMatrix, any': typed.referToSelf(
        (self: TypedFunction) =>
          (x: DenseMatrix, y: unknown): DenseMatrix =>
            matAlgo14xDs(x, y, self, false)
      ),

      // Array-first handlers (bridge via matrix() where needed)
      'Array, Array': typed.referToSelf(
        (self: TypedFunction) =>
          (x: unknown[], y: unknown[]): unknown[][] =>
            matAlgo13xDD(toMatrix(x), toMatrix(y), self).valueOf()
      ),
      'Array, DenseMatrix': typed.referToSelf(
        (self: TypedFunction) =>
          (x: unknown[], y: DenseMatrix): DenseMatrix =>
            matAlgo13xDD(toMatrix(x), y, self)
      ),
      'Array, SparseMatrix': typed.referToSelf(
        (self: TypedFunction) =>
          (x: unknown[], y: SparseMatrix): DenseMatrix =>
            matAlgo03xDSf(toMatrix(x), y, self, false)
      ),
      'Array, any': typed.referToSelf(
        (self: TypedFunction) =>
          (x: unknown[], y: unknown): unknown[][] =>
            matAlgo14xDs(toMatrix(x), y, self, false).valueOf()
      )
    })
  }
)
