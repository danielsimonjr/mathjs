import { isInteger } from '../../utils/number.ts'
import { factory } from '../../utils/factory.ts'
import type { TypedFunction } from '../../core/function/typed.ts'
import type { ConfigOptions } from '../../core/config.ts'
import { createMod } from './mod.ts'
import { createMatAlgo01xDSid } from '../../type/matrix/utils/matAlgo01xDSid.ts'
import { createMatAlgo04xSidSid } from '../../type/matrix/utils/matAlgo04xSidSid.ts'
import { createMatAlgo10xSids } from '../../type/matrix/utils/matAlgo10xSids.ts'
import { createMatrixAlgorithmSuite } from '../../type/matrix/utils/matrixAlgorithmSuite.ts'
import { ArgumentsError } from '../../error/ArgumentsError.ts'

// Type definitions for gcd
interface BigNumberType {
  isInt(): boolean
  isZero(): boolean
  lt(other: BigNumberType): boolean
  neg(): BigNumberType
}

interface BigNumberConstructor {
  new (value: number): BigNumberType
}

interface FractionType {
  gcd(other: FractionType): FractionType
}

interface MatrixType {
  toArray(): unknown[]
}

interface GcdDependencies {
  typed: TypedFunction
  config: ConfigOptions
  round: TypedFunction
  matrix: TypedFunction
  equalScalar: TypedFunction
  zeros: TypedFunction
  BigNumber: BigNumberConstructor
  DenseMatrix: unknown
  concat: TypedFunction
}

const name = 'gcd'
const dependencies = [
  'typed',
  'config',
  'round',
  'matrix',
  'equalScalar',
  'zeros',
  'BigNumber',
  'DenseMatrix',
  'concat'
]

const gcdTypes = 'number | BigNumber | Fraction | Matrix | Array'
const gcdManyTypesSignature = `${gcdTypes}, ${gcdTypes}, ...${gcdTypes}`

function is1d(array: unknown[]): boolean {
  return !array.some((element) => Array.isArray(element))
}

export const createGcd = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({
    typed,
    matrix,
    config,
    round,
    equalScalar,
    zeros,
    BigNumber,
    DenseMatrix,
    concat
  }: GcdDependencies): TypedFunction => {
    const mod = createMod({
      typed,
      config,
      round,
      matrix,
      equalScalar,
      zeros,
      DenseMatrix,
      concat
    })
    const matAlgo01xDSid = createMatAlgo01xDSid({ typed })
    const matAlgo04xSidSid = createMatAlgo04xSidSid({ typed, equalScalar })
    const matAlgo10xSids = createMatAlgo10xSids({ typed, DenseMatrix })
    const matrixAlgorithmSuite = createMatrixAlgorithmSuite({
      typed,
      matrix,
      concat
    })

    /**
     * Calculate the greatest common divisor for two or more values or arrays.
     *
     * For matrices, the function is evaluated element wise.
     *
     * Syntax:
     *
     *    math.gcd(a, b)
     *    math.gcd(a, b, c, ...)
     *
     * Examples:
     *
     *    math.gcd(8, 12)              // returns 4
     *    math.gcd(-4, 6)              // returns 2
     *    math.gcd(25, 15, -10)        // returns 5
     *
     *    math.gcd([8, -4], [12, 6])   // returns [4, 2]
     *
     * See also:
     *
     *    lcm, xgcd
     *
     * @param {... number | BigNumber | Fraction | Array | Matrix} args  Two or more integer numbers
     * @return {number | BigNumber | Fraction | Array | Matrix}                           The greatest common divisor
     */
    return typed(
      name,
      {
        'number, number': _gcdNumber,
        'BigNumber, BigNumber': _gcdBigNumber,
        'Fraction, Fraction': (
          x: FractionType,
          y: FractionType
        ): FractionType => x.gcd(y)
      },
      matrixAlgorithmSuite({
        SS: matAlgo04xSidSid,
        DS: matAlgo01xDSid,
        Ss: matAlgo10xSids
      }),
      {
        [gcdManyTypesSignature]: typed.referToSelf(
          (self: TypedFunction) =>
            (a: unknown, b: unknown, args: unknown[]) => {
              let res = self(a, b)
              for (let i = 0; i < args.length; i++) {
                res = self(res, args[i])
              }
              return res
            }
        ),
        Array: typed.referToSelf(
          (self: TypedFunction) => (array: unknown[]) => {
            if (
              array.length === 1 &&
              Array.isArray(array[0]) &&
              is1d(array[0])
            ) {
              return self(...array[0])
            }
            if (is1d(array)) {
              return self(...array)
            }
            throw new ArgumentsError('gcd() supports only 1d matrices!')
          }
        ),
        Matrix: typed.referToSelf(
          (self: TypedFunction) => (matrixArg: MatrixType) => {
            return self(matrixArg.toArray())
          }
        )
      }
    )

    /**
     * Calculate gcd for numbers
     * @param {number} a
     * @param {number} b
     * @returns {number} Returns the greatest common denominator of a and b
     * @private
     */
    function _gcdNumber(a: number, b: number): number {
      if (!isInteger(a) || !isInteger(b)) {
        throw new Error('Parameters in function gcd must be integer numbers')
      }

      // https://en.wikipedia.org/wiki/Euclidean_algorithm
      let r: number
      while (b !== 0) {
        r = mod(a, b) as number
        a = b
        b = r
      }
      return a < 0 ? -a : a
    }

    /**
     * Calculate gcd for BigNumbers
     * @param {BigNumber} a
     * @param {BigNumber} b
     * @returns {BigNumber} Returns greatest common denominator of a and b
     * @private
     */
    function _gcdBigNumber(a: BigNumberType, b: BigNumberType): BigNumberType {
      if (!a.isInt() || !b.isInt()) {
        throw new Error('Parameters in function gcd must be integer numbers')
      }

      // https://en.wikipedia.org/wiki/Euclidean_algorithm
      const zero = new BigNumber(0)
      while (!b.isZero()) {
        const r = mod(a, b) as BigNumberType
        a = b
        b = r
      }
      return a.lt(zero) ? a.neg() : a
    }
  }
)
