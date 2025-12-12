import { Decimal } from '../../type/local/Decimal.ts'
import { factory } from '../../utils/factory.ts'
import type { TypedFunction } from '../../core/function/typed.ts'
import type { MathJsConfig } from '../../core/create.ts'
import { deepMap } from '../../utils/collection.ts'
import { isInteger, nearlyEqual } from '../../utils/number.ts'
import { nearlyEqual as bigNearlyEqual } from '../../utils/bignumber/nearlyEqual.ts'
import { createMatAlgo11xS0s } from '../../type/matrix/utils/matAlgo11xS0s.ts'
import { createMatAlgo12xSfs } from '../../type/matrix/utils/matAlgo12xSfs.ts'
import { createMatAlgo14xDs } from '../../type/matrix/utils/matAlgo14xDs.ts'

const name = 'floor'
const dependencies = ['typed', 'config', 'round', 'matrix', 'equalScalar', 'zeros', 'DenseMatrix']

const bigTen = new (Decimal as any)(10)

export const createFloorNumber = /* #__PURE__ */ factory(
  name, ['typed', 'config', 'round'] as const, ({ typed, config, round }: { typed: any, config: any, round: any }) => {
    function _floorNumber (x: number): number {
      // First, if the floor and the round are identical we can be
      // quite comfortable that is the best answer:
      const f = Math.floor(x)
      const r = round(x)
      if (f === r) return f
      // OK, they are different. If x is truly distinct from f but
      // appears indistinguishable from r, presume it really is just
      // the integer r with rounding/computation error, and return that
      if (
        nearlyEqual(x, r, config.relTol, config.absTol) &&
        !nearlyEqual(x, f, config.relTol, config.absTol)
      ) {
        return r
      }
      // Otherwise (x distinct from both r and f, or indistinguishable from
      // both r and f) may as well just return f, as that's the best
      // candidate we can discern:
      return f
    }

    return typed(name, {
      number: _floorNumber,
      'number, number': function (x: number, n: number): number {
        if (!isInteger(n)) {
          throw new RangeError(
            'number of decimals in function floor must be an integer')
        }
        if (n < 0 || n > 15) {
          throw new RangeError(
            'number of decimals in floor number must be in range 0 - 15')
        }
        const shift = 10 ** n
        return _floorNumber(x * shift) / shift
      }
    })
  }
)

export const createFloor = /* #__PURE__ */ factory(name, dependencies, ({ typed, config, round, matrix, equalScalar, zeros, DenseMatrix }: { typed: any, config: any, round: any, matrix: any, equalScalar: any, zeros: any, DenseMatrix: any }) => {
  const matAlgo11xS0s = createMatAlgo11xS0s({ typed, equalScalar })
  const matAlgo12xSfs = createMatAlgo12xSfs({ typed, DenseMatrix })
  const matAlgo14xDs = createMatAlgo14xDs({ typed })

  const floorNumber = createFloorNumber({ typed, config, round })
  function _bigFloor (x: any): any {
    // see _floorNumber above for rationale
    const bne = (a: any, b: any) => bigNearlyEqual(a, b, config.relTol, config.absTol)
    const f = x.floor()
    const r = round(x)
    if (f.eq(r)) return f
    if (bne(x, r) && !bne(x, f)) return r
    return f
  }
  /**
   * Round a value towards minus infinity.
   * For matrices, the function is evaluated element wise.
   *
   * Syntax:
   *
   *    math.floor(x)
   *    math.floor(x, n)
   *    math.floor(unit, valuelessUnit)
   *    math.floor(unit, n, valuelessUnit)
   *
   * Examples:
   *
   *    math.floor(3.2)              // returns number 3
   *    math.floor(3.8)              // returns number 3
   *    math.floor(-4.2)             // returns number -5
   *    math.floor(-4.7)             // returns number -5
   *
   *    math.floor(3.212, 2)          // returns number 3.21
   *    math.floor(3.288, 2)          // returns number 3.28
   *    math.floor(-4.212, 2)         // returns number -4.22
   *    math.floor(-4.782, 2)         // returns number -4.79
   *
   *    const c = math.complex(3.24, -2.71)
   *    math.floor(c)                 // returns Complex 3 - 3i
   *    math.floor(c, 1)              // returns Complex 3.2 -2.8i
   *
   *    const unit = math.unit('3.241 cm')
   *    const cm = math.unit('cm')
   *    const mm = math.unit('mm')
   *    math.floor(unit, 1, cm)      // returns Unit 3.2 cm
   *    math.floor(unit, 1, mm)      // returns Unit 32.4 mm
   *
   *    math.floor([3.2, 3.8, -4.7])       // returns Array [3, 3, -5]
   *    math.floor([3.21, 3.82, -4.71], 1)  // returns Array [3.2, 3.8, -4.8]
   *
   *    math.floor(math.tau, [2, 3])  // returns Array [6.28, 6.283]
   *
   *    // Note that floor(array, array) currently not implemented.
   *
   * See also:
   *
   *    ceil, fix, round
   *
   * @param  {number | BigNumber | Fraction | Complex | Unit | Array | Matrix} x  Value to be rounded
   * @param  {number | BigNumber | Array} [n=0]                            Number of decimals
   * @param  {Unit} [valuelessUnit]                                        A valueless unit
   * @return {number | BigNumber | Fraction | Complex | Unit | Array | Matrix} Rounded value
   */
  return typed('floor', {
    number: floorNumber.signatures.number,
    'number,number': floorNumber.signatures['number,number'],

    Complex: function (x: any): any {
      return x.floor()
    },

    'Complex, number': function (x: any, n: number): any {
      return x.floor(n)
    },

    'Complex, BigNumber': function (x: any, n: any): any {
      return x.floor((n as any).toNumber())
    },

    BigNumber: _bigFloor,

    'BigNumber, BigNumber': function (x: any, n: any): any {
      const shift = bigTen.pow(n)
      return _bigFloor(x.mul(shift)).div(shift)
    },

    bigint: (b: bigint): bigint => b,
    'bigint, number': (b: bigint, _dummy: number): bigint => b,
    'bigint, BigNumber': (b: bigint, _dummy: any): bigint => b,

    Fraction: function (x: any): any {
      return x.floor()
    },

    'Fraction, number': function (x: any, n: number): any {
      return x.floor(n)
    },

    'Fraction, BigNumber': function (x: any, n: any): any {
      return x.floor((n as any).toNumber())
    },

    'Unit, number, Unit': typed.referToSelf((self: any) => function (x: any, n: number, unit: any): any {
      const valueless = x.toNumeric(unit)
      return unit.multiply(self(valueless, n))
    }),

    'Unit, BigNumber, Unit': typed.referToSelf((self: any) => (x: any, n: any, unit: any): any => self(x, (n as any).toNumber(), unit)),

    'Array | Matrix, number | BigNumber, Unit': typed.referToSelf((self: any) => (x: any, n: any, unit: any): any => {
      // deep map collection, skip zeros since floor(0) = 0
      return deepMap(x, (value) => self(value, n, unit), true)
    }),

    'Array | Matrix | Unit, Unit': typed.referToSelf((self: any) => (x: any, unit: any): any => self(x, 0, unit)),

    'Array | Matrix': typed.referToSelf((self: any) => (x: any): any => {
      // deep map collection, skip zeros since floor(0) = 0
      return deepMap(x, self, true)
    }),

    'Array, number | BigNumber': typed.referToSelf((self: any) => (x: any, n: any): any => {
      // deep map collection, skip zeros since ceil(0) = 0
      return deepMap(x, (i) => self(i, n), true)
    }),

    'SparseMatrix, number | BigNumber': typed.referToSelf((self: any) => (x: any, y: any): any => {
      return matAlgo11xS0s(x, y, self, false)
    }),

    'DenseMatrix, number | BigNumber': typed.referToSelf((self: any) => (x: any, y: any): any => {
      return matAlgo14xDs(x, y, self, false)
    }),

    'number | Complex | Fraction | BigNumber, Array':
      typed.referToSelf((self: any) => (x: any, y: any): any => {
        // use matrix implementation
        return matAlgo14xDs(matrix(y), x, self, true).valueOf()
      }),

    'number | Complex | Fraction | BigNumber, Matrix':
      typed.referToSelf((self: any) => (x: any, y: any): any => {
        if (equalScalar(x, 0)) return zeros(y.size(), y.storage())
        if (y.storage() === 'dense') {
          return matAlgo14xDs(y, x, self, true)
        }
        return matAlgo12xSfs(y, x, self, true)
      })
  })
})
