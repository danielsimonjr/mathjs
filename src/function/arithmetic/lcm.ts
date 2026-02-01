import { factory } from '../../utils/factory.ts'
import type { TypedFunction } from '../../core/function/typed.ts'
import { createMatAlgo02xDS0 } from '../../type/matrix/utils/matAlgo02xDS0.ts'
import { createMatAlgo06xS0S0 } from '../../type/matrix/utils/matAlgo06xS0S0.ts'
import { createMatAlgo11xS0s } from '../../type/matrix/utils/matAlgo11xS0s.ts'
import { createMatrixAlgorithmSuite } from '../../type/matrix/utils/matrixAlgorithmSuite.ts'
import { lcmNumber } from '../../plain/number/index.ts'

// Type definitions for lcm
interface BigNumberType {
  isInt(): boolean
  isZero(): boolean
  times(other: BigNumberType): BigNumberType
  mod(other: BigNumberType): BigNumberType
  div(other: BigNumberType): BigNumberType
  abs(): BigNumberType
}

interface FractionType {
  lcm(other: FractionType): FractionType
}

interface LcmDependencies {
  typed: TypedFunction
  matrix: TypedFunction
  equalScalar: TypedFunction
  concat: TypedFunction
}

const name = 'lcm'
const dependencies = ['typed', 'matrix', 'equalScalar', 'concat']

export const createLcm = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed, matrix, equalScalar, concat }: LcmDependencies): TypedFunction => {
    const matAlgo02xDS0 = createMatAlgo02xDS0({ typed, equalScalar })
    const matAlgo06xS0S0 = createMatAlgo06xS0S0({ typed, equalScalar })
    const matAlgo11xS0s = createMatAlgo11xS0s({ typed, equalScalar })
    const matrixAlgorithmSuite = createMatrixAlgorithmSuite({
      typed,
      matrix,
      concat
    })

    const lcmTypes = 'number | BigNumber | Fraction | Matrix | Array'
    const lcmManySignature: Record<string, TypedFunction> = {}
    lcmManySignature[`${lcmTypes}, ${lcmTypes}, ...${lcmTypes}`] =
      typed.referToSelf(
        (self: TypedFunction) => (a: unknown, b: unknown, args: unknown[]) => {
          let res = self(a, b)
          for (let i = 0; i < args.length; i++) {
            res = self(res, args[i])
          }
          return res
        }
      )

    /**
     * Calculate the least common multiple for two or more values or arrays.
     *
     * lcm is defined as:
     *
     *     lcm(a, b) = abs(a * b) / gcd(a, b)
     *
     * For matrices, the function is evaluated element wise.
     *
     * Syntax:
     *
     *    math.lcm(a, b)
     *    math.lcm(a, b, c, ...)
     *
     * Examples:
     *
     *    math.lcm(4, 6)               // returns 12
     *    math.lcm(6, 21)              // returns 42
     *    math.lcm(6, 21, 5)           // returns 210
     *
     *    math.lcm([4, 6], [6, 21])    // returns [12, 42]
     *
     * See also:
     *
     *    gcd, xgcd
     *
     * @param {... number | BigNumber | Array | Matrix} args  Two or more integer numbers
     * @return {number | BigNumber | Array | Matrix}                           The least common multiple
     */
    return typed(
      name,
      {
        'number, number': lcmNumber,
        'BigNumber, BigNumber': _lcmBigNumber,
        'Fraction, Fraction': (
          x: FractionType,
          y: FractionType
        ): FractionType => x.lcm(y)
      },
      matrixAlgorithmSuite({
        SS: matAlgo06xS0S0,
        DS: matAlgo02xDS0,
        Ss: matAlgo11xS0s
      }),
      lcmManySignature
    )

    /**
     * Calculate lcm for two BigNumbers
     * @param {BigNumber} a
     * @param {BigNumber} b
     * @returns {BigNumber} Returns the least common multiple of a and b
     * @private
     */
    function _lcmBigNumber(a: BigNumberType, b: BigNumberType): BigNumberType {
      if (!a.isInt() || !b.isInt()) {
        throw new Error('Parameters in function lcm must be integer numbers')
      }

      if (a.isZero()) {
        return a
      }
      if (b.isZero()) {
        return b
      }

      // https://en.wikipedia.org/wiki/Euclidean_algorithm
      // evaluate lcm here inline to reduce overhead
      const prod = a.times(b)
      while (!b.isZero()) {
        const t = b
        b = a.mod(t)
        a = t
      }
      return prod.div(a).abs()
    }
  }
)
