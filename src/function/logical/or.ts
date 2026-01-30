import { createMatAlgo03xDSf } from '../../type/matrix/utils/matAlgo03xDSf.ts'
import { createMatAlgo12xSfs } from '../../type/matrix/utils/matAlgo12xSfs.ts'
import { createMatAlgo05xSfSf } from '../../type/matrix/utils/matAlgo05xSfSf.ts'
import { factory } from '../../utils/factory.ts'
import { createMatrixAlgorithmSuite } from '../../type/matrix/utils/matrixAlgorithmSuite.ts'
import { orNumber } from '../../plain/number/index.ts'
import type { TypedFunction } from '../../core/function/typed.ts'

// Type definitions for logical or operation
interface Complex {
  re: number
  im: number
}

interface BigNumber {
  isZero(): boolean
  isNaN(): boolean
}

interface Unit {
  value: number | BigNumber | Complex | null
}

interface Matrix {
  size(): number[]
  storage(): string
}

interface OrDependencies {
  typed: TypedFunction
  matrix: (data: unknown[]) => Matrix
  equalScalar: TypedFunction
  DenseMatrix: new (data: unknown) => Matrix
  concat: TypedFunction
}

const name = 'or'
const dependencies = ['typed', 'matrix', 'equalScalar', 'DenseMatrix', 'concat']

export const createOr = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed, matrix, equalScalar, DenseMatrix, concat }: OrDependencies) => {
    const matAlgo03xDSf = createMatAlgo03xDSf({ typed })
    const matAlgo05xSfSf = createMatAlgo05xSfSf({ typed, equalScalar })
    const matAlgo12xSfs = createMatAlgo12xSfs({ typed, DenseMatrix })
    const matrixAlgorithmSuite = createMatrixAlgorithmSuite({
      typed,
      matrix,
      concat
    })

    /**
     * Logical `or`. Test if at least one value is defined with a nonzero/nonempty value.
     * For matrices, the function is evaluated element wise.
     *
     * Syntax:
     *
     *    math.or(x, y)
     *
     * Examples:
     *
     *    math.or(2, 4)   // returns true
     *
     *    a = [2, 5, 0]
     *    b = [0, 22, 0]
     *    c = 0
     *
     *    math.or(a, b)   // returns [true, true, false]
     *    math.or(b, c)   // returns [false, true, false]
     *
     * See also:
     *
     *    and, not, xor
     *
     * @param  {number | BigNumber | bigint | Complex | Unit | Array | Matrix} x First value to check
     * @param  {number | BigNumber | bigint | Complex | Unit | Array | Matrix} y Second value to check
     * @return {boolean | Array | Matrix}
     *            Returns true when one of the inputs is defined with a nonzero/nonempty value.
     */
    return typed(
      name,
      {
        'number, number': orNumber,

        'Complex, Complex': function (x: Complex, y: Complex): boolean {
          return x.re !== 0 || x.im !== 0 || y.re !== 0 || y.im !== 0
        },

        'BigNumber, BigNumber': function (x: BigNumber, y: BigNumber): boolean {
          return (!x.isZero() && !x.isNaN()) || (!y.isZero() && !y.isNaN())
        },

        'bigint, bigint': orNumber,

        'Unit, Unit': typed.referToSelf(
          (self: TypedFunction) =>
            (x: Unit, y: Unit): boolean =>
              self(x.value || 0, y.value || 0)
        )
      },
      matrixAlgorithmSuite({
        SS: matAlgo05xSfSf,
        DS: matAlgo03xDSf,
        Ss: matAlgo12xSfs
      })
    )
  }
)
