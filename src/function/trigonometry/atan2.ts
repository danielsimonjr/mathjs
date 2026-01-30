import { factory } from '../../utils/factory.ts'
import { createMatAlgo02xDS0 } from '../../type/matrix/utils/matAlgo02xDS0.ts'
import { createMatAlgo03xDSf } from '../../type/matrix/utils/matAlgo03xDSf.ts'
import { createMatAlgo09xS0Sf } from '../../type/matrix/utils/matAlgo09xS0Sf.ts'
import { createMatAlgo11xS0s } from '../../type/matrix/utils/matAlgo11xS0s.ts'
import { createMatAlgo12xSfs } from '../../type/matrix/utils/matAlgo12xSfs.ts'
import { createMatrixAlgorithmSuite } from '../../type/matrix/utils/matrixAlgorithmSuite.ts'
import type { TypedFunction } from '../../core/function/typed.ts'

// Type definitions for atan2
interface BigNumberType {
  // BigNumber instance
}

interface BigNumberConstructor {
  atan2(y: BigNumberType, x: BigNumberType): BigNumberType
}

interface Matrix {
  // Matrix instance
}

interface MatrixConstructor {
  (data: unknown[] | unknown[][], storage?: 'dense' | 'sparse'): Matrix
}

interface Atan2Dependencies {
  typed: TypedFunction
  matrix: MatrixConstructor
  equalScalar: TypedFunction
  BigNumber: BigNumberConstructor
  DenseMatrix: new (data: unknown) => unknown
  concat: TypedFunction
}

const name = 'atan2'
const dependencies = [
  'typed',
  'matrix',
  'equalScalar',
  'BigNumber',
  'DenseMatrix',
  'concat'
]

export const createAtan2 = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({
    typed,
    matrix,
    equalScalar,
    BigNumber,
    DenseMatrix,
    concat
  }: Atan2Dependencies) => {
    const matAlgo02xDS0 = createMatAlgo02xDS0({ typed, equalScalar })
    const matAlgo03xDSf = createMatAlgo03xDSf({ typed })
    const matAlgo09xS0Sf = createMatAlgo09xS0Sf({ typed, equalScalar })
    const matAlgo11xS0s = createMatAlgo11xS0s({ typed, equalScalar })
    const matAlgo12xSfs = createMatAlgo12xSfs({ typed, DenseMatrix })
    const matrixAlgorithmSuite = createMatrixAlgorithmSuite({
      typed,
      matrix,
      concat
    })

    /**
     * Calculate the inverse tangent function with two arguments, y/x.
     * By providing two arguments, the right quadrant of the computed angle can be
     * determined.
     *
     * For matrices, the function is evaluated element wise.
     *
     * Syntax:
     *
     *    math.atan2(y, x)
     *
     * Examples:
     *
     *    math.atan2(2, 2) / math.pi       // returns number 0.25
     *
     *    const angle = math.unit(60, 'deg')
     *    const x = math.cos(angle)
     *    const y = math.sin(angle)
     *    math.atan2(y, x) * 180 / math.pi  // returns 60
     *
     *    math.atan(2)             // returns number 1.1071487177940904
     *
     * See also:
     *
     *    tan, atan, sin, cos
     *
     * @param {number | Array | Matrix} y  Second dimension
     * @param {number | Array | Matrix} x  First dimension
     * @return {number | Array | Matrix} Four-quadrant inverse tangent
     */
    return typed(
      name,
      {
        'number, number': Math.atan2,

        // Complex numbers doesn't seem to have a reasonable implementation of
        // atan2(). Even Matlab removed the support, after they only calculated
        // the atan only on base of the real part of the numbers and ignored
        // the imaginary.

        'BigNumber, BigNumber': (y: BigNumberType, x: BigNumberType): BigNumberType =>
          BigNumber.atan2(y, x)
      },
      matrixAlgorithmSuite({
        scalar: 'number | BigNumber',
        SS: matAlgo09xS0Sf,
        DS: matAlgo03xDSf,
        SD: matAlgo02xDS0,
        Ss: matAlgo11xS0s,
        sS: matAlgo12xSfs
      })
    )
  }
)
