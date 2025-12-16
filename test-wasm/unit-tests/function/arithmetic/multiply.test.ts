<<<<<<< HEAD
// @ts-nocheck
// test multiply
import assert from 'assert'

import math from '../../../../src/defaultInstance.ts'
=======
/**
 * Test for multiply - AssemblyScript-friendly TypeScript
 */
import assert from 'assert'

import math from '../../../../src/defaultInstance.ts'

interface MathNode {
  type: string
  toTex(): string
}
>>>>>>> claude/review-sprints-quality-checks-Rlfec
import { approxEqual, approxDeepEqual } from '../../../../tools/approx.js'
const multiply = math.multiply
const divide = math.divide
const matrix = math.matrix
const complex = math.complex
const bignumber = math.bignumber
const i = math.i
const unit = math.unit

<<<<<<< HEAD
describe('multiply', function () {
  describe('Scalar', function () {
    it('should multiply two numbers correctly', function () {
=======
describe('multiply', function (): void {
  describe('Scalar', function (): void {
    it('should multiply two numbers correctly', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      approxEqual(multiply(2, 3), 6)
      approxEqual(multiply(-2, 3), -6)
      approxEqual(multiply(-2, -3), 6)
      approxEqual(multiply(5, 0), 0)
      approxEqual(multiply(0, 5), 0)
      approxDeepEqual(multiply(0, Infinity), NaN)
      approxDeepEqual(multiply(2, Infinity), Infinity)
      approxDeepEqual(multiply(-2, Infinity), -Infinity)
    })

<<<<<<< HEAD
    it('should multiply bigint', function () {
      assert.strictEqual(multiply(2n, 3n), 6n)
    })

    it('should multiply booleans', function () {
=======
    it('should multiply bigint', function (): void {
      assert.strictEqual(multiply(2n, 3n), 6n)
    })

    it('should multiply booleans', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.strictEqual(multiply(true, true), 1)
      assert.strictEqual(multiply(true, false), 0)
      assert.strictEqual(multiply(false, true), 0)
      assert.strictEqual(multiply(false, false), 0)
    })

<<<<<<< HEAD
    it('should multiply mixed numbers and booleans', function () {
=======
    it('should multiply mixed numbers and booleans', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.strictEqual(multiply(2, true), 2)
      assert.strictEqual(multiply(2, false), 0)
      assert.strictEqual(multiply(true, 2), 2)
      assert.strictEqual(multiply(false, 2), 0)
    })

<<<<<<< HEAD
    it('should multiply mixed numbers and bigint', function () {
      assert.strictEqual(multiply(2, 3n), 6)
      assert.strictEqual(multiply(2n, 3), 6)

      assert.throws(function () {
        multiply(123123123123123123123n, 1)
      }, /Cannot implicitly convert bigint to number: value exceeds the max safe integer value/)
      assert.throws(function () {
=======
    it('should multiply mixed numbers and bigint', function (): void {
      assert.strictEqual(multiply(2, 3n), 6)
      assert.strictEqual(multiply(2n, 3), 6)

      assert.throws(function (): void {
        multiply(123123123123123123123n, 1)
      }, /Cannot implicitly convert bigint to number: value exceeds the max safe integer value/)
      assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
        multiply(1, 123123123123123123123n)
      }, /Cannot implicitly convert bigint to number: value exceeds the max safe integer value/)
    })

<<<<<<< HEAD
    it('should multiply bignumbers', function () {
=======
    it('should multiply bignumbers', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        multiply(bignumber(1.5), bignumber(0.2)),
        bignumber(0.3)
      )
      assert.deepStrictEqual(
        multiply(bignumber('1.3e5000'), bignumber('2')),
        bignumber('2.6e5000')
      )
    })

<<<<<<< HEAD
    it('should multiply mixed numbers and bignumbers', function () {
=======
    it('should multiply mixed numbers and bignumbers', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(multiply(bignumber(1.5), 0.2), bignumber(0.3))
      assert.deepStrictEqual(multiply(1.5, bignumber(0.2)), bignumber(0.3))
      assert.deepStrictEqual(
        multiply(bignumber('1.3e5000'), 2),
        bignumber('2.6e5000')
      )

<<<<<<< HEAD
      assert.throws(function () {
        multiply(1 / 3, bignumber(1).div(3))
      }, /Cannot implicitly convert a number with >15 significant digits to BigNumber/)
      assert.throws(function () {
=======
      assert.throws(function (): void {
        multiply(1 / 3, bignumber(1).div(3))
      }, /Cannot implicitly convert a number with >15 significant digits to BigNumber/)
      assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
        multiply(bignumber(1).div(3), 1 / 3)
      }, /Cannot implicitly convert a number with >15 significant digits to BigNumber/)
    })

<<<<<<< HEAD
    it('should multiply mixed bigints and BigNumbers', function () {
=======
    it('should multiply mixed bigints and BigNumbers', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(multiply(bignumber(2), 3n), bignumber(6))
      assert.deepStrictEqual(multiply(2n, bignumber(3)), bignumber(6))
    })

<<<<<<< HEAD
    it('should throw an error when multipling mixed fractions and bignumbers', function () {
      assert.throws(function () {
        multiply(math.bignumber('2'), math.fraction(1, 3))
      }, /Cannot implicitly convert a Fraction to BigNumber/)
      assert.throws(function () {
=======
    it('should throw an error when multipling mixed fractions and bignumbers', function (): void {
      assert.throws(function (): void {
        multiply(math.bignumber('2'), math.fraction(1, 3))
      }, /Cannot implicitly convert a Fraction to BigNumber/)
      assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
        multiply(math.fraction(1, 3), math.bignumber('2'))
      }, /Cannot implicitly convert a Fraction to BigNumber/)
    })

<<<<<<< HEAD
    it('should multiply mixed booleans and bignumbers', function () {
=======
    it('should multiply mixed booleans and bignumbers', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(multiply(bignumber(0.3), true), bignumber(0.3))
      assert.deepStrictEqual(multiply(bignumber(0.3), false), bignumber(0))
      assert.deepStrictEqual(multiply(false, bignumber('2')), bignumber(0))
      assert.deepStrictEqual(multiply(true, bignumber('2')), bignumber(2))
    })

<<<<<<< HEAD
    it('should multiply two complex numbers correctly', function () {
=======
    it('should multiply two complex numbers correctly', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      approxDeepEqual(multiply(complex(2, 3), 2), complex(4, 6))
      approxDeepEqual(multiply(complex(2, -3), -2), complex(-4, 6))
      approxDeepEqual(multiply(complex(2, -3), 2), complex(4, -6))
      approxDeepEqual(multiply(complex(-2, 3), 2), complex(-4, 6))
      approxDeepEqual(multiply(complex(-2, -3), 2), complex(-4, -6))
      approxDeepEqual(multiply(2, complex(2, 3)), complex(4, 6))
      approxDeepEqual(multiply(i, complex(2, 3)), complex(-3, 2))
      approxDeepEqual(multiply(complex(0, 1), complex(2, 3)), complex(-3, 2))
      approxDeepEqual(multiply(complex(1, 1), complex(2, 3)), complex(-1, 5))
      approxDeepEqual(multiply(complex(2, 3), complex(1, 1)), complex(-1, 5))
      approxDeepEqual(multiply(complex(2, 3), complex(2, 3)), complex(-5, 12))
      approxDeepEqual(divide(complex(-5, 12), complex(2, 3)), complex(2, 3))
      approxDeepEqual(multiply(complex(2, 3), 0), complex(0, 0))
      approxDeepEqual(multiply(complex(0, 3), complex(0, -4)), complex(12, 0))
      approxDeepEqual(multiply(multiply(3, i), multiply(-4, i)), complex(12, 0))
      approxDeepEqual(multiply(math.i, Infinity), complex(Infinity, Infinity))
      approxDeepEqual(multiply(Infinity, math.i), complex(Infinity, Infinity))

      approxDeepEqual(multiply(complex(2, 0), complex(0, 2)), complex(0, 4))
      approxDeepEqual(multiply(complex(0, 2), complex(0, 2)), -4)
      approxDeepEqual(multiply(complex(2, 2), complex(0, 2)), complex(-4, 4))
      approxDeepEqual(multiply(complex(2, 0), complex(2, 2)), complex(4, 4))
      approxDeepEqual(multiply(complex(0, 2), complex(2, 2)), complex(-4, 4))
      approxDeepEqual(multiply(complex(2, 2), complex(2, 2)), complex(0, 8))
      approxDeepEqual(multiply(complex(2, 0), complex(2, 0)), 4)
      approxDeepEqual(multiply(complex(0, 2), complex(2, 0)), complex(0, 4))
      approxDeepEqual(multiply(complex(2, 2), complex(2, 0)), complex(4, 4))

      approxDeepEqual(multiply(complex(2, 3), complex(4, 5)), complex(-7, 22))
      approxDeepEqual(multiply(complex(2, 3), complex(4, -5)), complex(23, 2))
      approxDeepEqual(multiply(complex(2, 3), complex(-4, 5)), complex(-23, -2))
      approxDeepEqual(multiply(complex(2, 3), complex(-4, -5)), complex(7, -22))
      approxDeepEqual(multiply(complex(2, -3), complex(4, 5)), complex(23, -2))
      approxDeepEqual(
        multiply(complex(2, -3), complex(4, -5)),
        complex(-7, -22)
      )
      approxDeepEqual(multiply(complex(2, -3), complex(-4, 5)), complex(7, 22))
      approxDeepEqual(
        multiply(complex(2, -3), complex(-4, -5)),
        complex(-23, 2)
      )
      approxDeepEqual(multiply(complex(-2, 3), complex(4, 5)), complex(-23, 2))
      approxDeepEqual(multiply(complex(-2, 3), complex(4, -5)), complex(7, 22))
      approxDeepEqual(
        multiply(complex(-2, 3), complex(-4, 5)),
        complex(-7, -22)
      )
      approxDeepEqual(
        multiply(complex(-2, 3), complex(-4, -5)),
        complex(23, -2)
      )
      approxDeepEqual(multiply(complex(-2, -3), complex(4, 5)), complex(7, -22))
      approxDeepEqual(
        multiply(complex(-2, -3), complex(4, -5)),
        complex(-23, -2)
      )
      approxDeepEqual(multiply(complex(-2, -3), complex(-4, 5)), complex(23, 2))
      approxDeepEqual(
        multiply(complex(-2, -3), complex(-4, -5)),
        complex(-7, 22)
      )
    })

<<<<<<< HEAD
    it('should multiply mixed complex numbers and numbers', function () {
=======
    it('should multiply mixed complex numbers and numbers', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        multiply(math.complex(6, -4), 2),
        math.complex(12, -8)
      )
      assert.deepStrictEqual(
        multiply(2, math.complex(2, 4)),
        math.complex(4, 8)
      )
    })

<<<<<<< HEAD
    it('should multiply mixed complex numbers and big numbers', function () {
=======
    it('should multiply mixed complex numbers and big numbers', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        multiply(math.complex(6, -4), math.bignumber(2)),
        math.complex(12, -8)
      )
      assert.deepStrictEqual(
        multiply(math.bignumber(2), math.complex(2, 4)),
        math.complex(4, 8)
      )
    })

<<<<<<< HEAD
    it('should multiply two fractions', function () {
=======
    it('should multiply two fractions', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      const a = math.fraction(1, 4)
      assert.strictEqual(multiply(a, math.fraction(1, 2)).toString(), '0.125')
      assert.strictEqual(a.toString(), '0.25')

      assert.strictEqual(
        multiply(math.fraction(2), math.fraction(1, 3)).toString(),
        '0.(6)'
      )
    })

<<<<<<< HEAD
    it('should multiply mixed fractions and numbers', function () {
=======
    it('should multiply mixed fractions and numbers', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        multiply(2, math.fraction(1, 3)),
        math.fraction(2, 3)
      )
      assert.deepStrictEqual(
        multiply(math.fraction(1, 3), 2),
        math.fraction(2, 3)
      )
    })

<<<<<<< HEAD
    it('should multiply mixed fractions and bigints', function () {
=======
    it('should multiply mixed fractions and bigints', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        multiply(2n, math.fraction(1, 3)),
        math.fraction(2, 3)
      )
      assert.deepStrictEqual(
        multiply(math.fraction(1, 3), 2n),
        math.fraction(2, 3)
      )
    })

<<<<<<< HEAD
    it('should multiply a number and a unit correctly', function () {
=======
    it('should multiply a number and a unit correctly', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.strictEqual(multiply(2, unit('5 mm')).toString(), '10 mm')
      assert.strictEqual(multiply(2, unit('5 mm')).toString(), '10 mm')
      assert.strictEqual(multiply(10, unit('celsius')).toString(), '10 celsius')
      assert.strictEqual(multiply(unit('5 mm'), 2).toString(), '10 mm')
      assert.strictEqual(multiply(unit('5 mm'), 0).toString(), '0 mm')
      assert.strictEqual(multiply(unit('celsius'), 10).toString(), '10 celsius')

      assert.strictEqual(
        multiply(unit(math.fraction(1, 4), 'm'), 3).toString(),
        '3/4 m'
      )
      assert.strictEqual(
        multiply(3, unit(math.fraction(1, 4), 'm')).toString(),
        '3/4 m'
      )
      assert.strictEqual(
        multiply(math.fraction(1, 4), unit(3, 'm')).toString(),
        '3/4 m'
      )
      assert.strictEqual(
        multiply(unit(3, 'm'), math.fraction(1, 4)).toString(),
        '3/4 m'
      )

      assert.strictEqual(
        multiply(unit(math.complex(9, 8), 'm'), 2).toString(),
        '(18 + 16i) m'
      )
      assert.strictEqual(
        math.format(
          multiply(unit(math.complex(2, 3), 'g'), math.complex(4, 5)),
          14
        ),
        '(-7 + 22i) g'
      )
    })

<<<<<<< HEAD
    it('should multiply a number and a unit without value correctly', function () {
=======
    it('should multiply a number and a unit without value correctly', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.strictEqual(multiply(2, unit('mm')).toString(), '2 mm')
      assert.strictEqual(multiply(2, unit('km')).toString(), '2 km')
      assert.strictEqual(multiply(2, unit('inch')).toString(), '2 inch')
      assert.strictEqual(multiply(unit('mm'), 2).toString(), '2 mm')
      assert.strictEqual(multiply(unit('km'), 2).toString(), '2 km')
      assert.strictEqual(multiply(unit('inch'), 2).toString(), '2 inch')
    })

<<<<<<< HEAD
    it('should multiply a bigint and a unit value correctly', function () {
      assert.strictEqual(multiply(2n, unit('5 mm')).toString(), '10 mm')
    })

    it('should multiply two units correctly', function () {
=======
    it('should multiply a bigint and a unit value correctly', function (): void {
      assert.strictEqual(multiply(2n, unit('5 mm')).toString(), '10 mm')
    })

    it('should multiply two units correctly', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.strictEqual(multiply(unit('2 m'), unit('4 m')).toString(), '8 m^2')
      assert.strictEqual(
        multiply(unit('2 ft'), unit('4 ft')).toString(),
        '8 ft^2'
      )
      assert.strictEqual(
        multiply(unit('65 mi/h'), unit('2 h')).to('mi').toString(),
        '130 mi'
      )
      assert.strictEqual(
        multiply(unit('2 L'), unit('1 s^-1')).toString(),
        '2 L / s'
      )
      assert.strictEqual(
        multiply(unit('2 m/s'), unit('0.5 s/m')).toString(),
        '1'
      )
      assert.strictEqual(
        multiply(
          unit(math.complex(3, -4), 'N'),
          unit(math.complex(7, -2), 'm')
        ).toString(),
        '(13 - 34i) J'
      )
    })

<<<<<<< HEAD
    it('should evaluate a complicated unit multiplication', function () {
=======
    it('should evaluate a complicated unit multiplication', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      const v1 = math.evaluate('0.1 kg/s * 4.2 J/degC/g * 5 degC')
      approxEqual(v1.value, 2100)
    })

<<<<<<< HEAD
    it('should multiply valueless units correctly', function () {
=======
    it('should multiply valueless units correctly', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.strictEqual(multiply(unit('m'), unit('4 m')).toString(), '4 m^2')
      assert.strictEqual(multiply(unit('ft'), unit('4 ft')).format(5), '4 ft^2')
      assert.strictEqual(
        multiply(unit('65 mi/h'), unit('h')).to('mi').toString(),
        '65 mi'
      )
      assert.strictEqual(
        multiply(unit('2 L'), unit('s^-1')).toString(),
        '2 L / s'
      )
      assert.strictEqual(
        multiply(unit('m/s'), unit('h/m')).toString(),
        '(m h) / (s m)'
      )
    })

    // TODO: cleanup once decided to not downgrade BigNumber to number
    // eslint-disable-next-line mocha/no-skipped-tests
    it.skip('should multiply a bignumber and a unit correctly', function () {
      assert.strictEqual(
        multiply(bignumber(2), unit('5 mm')).toString(),
        '10 mm'
      )
      assert.strictEqual(
        multiply(bignumber(2), unit('5 mm')).toString(),
        '10 mm'
      )
      assert.strictEqual(
        multiply(unit('5 mm'), bignumber(2)).toString(),
        '10 mm'
      )
      assert.strictEqual(multiply(unit('5 mm'), bignumber(0)).toString(), '0 m')
    })

    // TODO: cleanup once decided to not downgrade BigNumber to number
    // eslint-disable-next-line mocha/no-skipped-tests
    it.skip('should multiply a bignumber and a unit without value correctly', function () {
      assert.strictEqual(multiply(bignumber(2), unit('mm')).toString(), '2 mm')
      assert.strictEqual(multiply(bignumber(2), unit('km')).toString(), '2 km')
      assert.strictEqual(
        multiply(bignumber(2), unit('inch')).toString(),
        '2 inch'
      )
      assert.strictEqual(multiply(unit('mm'), bignumber(2)).toString(), '2 mm')
      assert.strictEqual(multiply(unit('km'), bignumber(2)).toString(), '2 km')
      assert.strictEqual(
        multiply(unit('inch'), bignumber(2)).toString(),
        '2 inch'
      )
    })

<<<<<<< HEAD
    it('should throw an error in case of unit non-numeric argument', function () {
      // Multiplying two units is supported now
      // assert.throws(function () {multiply(math.unit('5cm'), math.unit('4cm'));}, /TypeError: Unexpected type/)
      // Complex units are supported now
      // assert.throws(function () {multiply(math.unit('5cm'), math.complex('2+3i'))}, /TypeError: Unexpected type/)
      // assert.throws(function () {multiply(math.complex('2+3i'), math.unit('5cm'))}, /TypeError: Unexpected type/)
    })

    it('should throw an error if used with strings', function () {
      assert.throws(function () {
        multiply('hello', 'world')
      })
      assert.throws(function () {
=======
    it('should throw an error in case of unit non-numeric argument', function (): void {
      // Multiplying two units is supported now
      // assert.throws(function (): void {multiply(math.unit('5cm'), math.unit('4cm'));}, /TypeError: Unexpected type/)
      // Complex units are supported now
      // assert.throws(function (): void {multiply(math.unit('5cm'), math.complex('2+3i'))}, /TypeError: Unexpected type/)
      // assert.throws(function (): void {multiply(math.complex('2+3i'), math.unit('5cm'))}, /TypeError: Unexpected type/)
    })

    it('should throw an error if used with strings', function (): void {
      assert.throws(function (): void {
        multiply('hello', 'world')
      })
      assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
        multiply('hello', 2)
      })
    })
  })

<<<<<<< HEAD
  it('should multiply mixed array and matrix', function () {
=======
  it('should multiply mixed array and matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const a = [
      [1, 2],
      [3, 4]
    ]
    const b = [
      [2, 0],
      [0, 2]
    ]

    approxDeepEqual(
      multiply(a, matrix(b)),
      matrix([
        [2, 4],
        [6, 8]
      ])
    )
    approxDeepEqual(
      multiply(matrix(a), b),
      matrix([
        [2, 4],
        [6, 8]
      ])
    )

    // test with vectors, returning a scalar
    const c = [1, 2, 3]
    const d = [4, 5, 6]

    assert.strictEqual(multiply(c, matrix(d)), 32)
    assert.strictEqual(multiply(matrix(c), d), 32)
  })

<<<<<<< HEAD
  describe('squeeze', function () {
    // math.js v1 and v2 did squeeze output being a vector. Changed in v3

    it('should NOT squeeze scalar results of matrix * matrix', function () {
=======
  describe('squeeze', function (): void {
    // math.js v1 and v2 did squeeze output being a vector. Changed in v3

    it('should NOT squeeze scalar results of matrix * matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      const a = [[1, 2, 3]]
      const b = [[4], [5], [6]]
      assert.deepStrictEqual(multiply(a, b), [[32]])
    })

<<<<<<< HEAD
    it('should NOT squeeze scalar results of vector * matrix', function () {
=======
    it('should NOT squeeze scalar results of vector * matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      const a = [1, 2, 3]
      const b = [[4], [5], [6]]
      assert.deepStrictEqual(multiply(a, b), [32])
    })

<<<<<<< HEAD
    it('should NOT squeeze scalar results of matrix * vector', function () {
=======
    it('should NOT squeeze scalar results of matrix * vector', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      const a = [[1, 2, 3]]
      const b = [4, 5, 6]
      assert.deepStrictEqual(multiply(a, b), [32])
    })
  })

<<<<<<< HEAD
  it('should throw an error when multiplying matrices with incompatible sizes', function () {
    // vector * vector
    assert.throws(function () {
=======
  it('should throw an error when multiplying matrices with incompatible sizes', function (): void {
    // vector * vector
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      multiply([1, 1], [1, 1, 1])
    })

    // matrix * matrix
<<<<<<< HEAD
    assert.throws(function () {
      multiply([[1, 1]], [[1, 1]])
    })
    assert.throws(function () {
=======
    assert.throws(function (): void {
      multiply([[1, 1]], [[1, 1]])
    })
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      multiply(
        [[1, 1]],
        [
          [1, 1],
          [1, 1],
          [1, 1]
        ]
      )
    })

    // matrix * vector
<<<<<<< HEAD
    assert.throws(function () {
=======
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      multiply(
        [
          [1, 1],
          [1, 1]
        ],
        [1, 1, 1]
      )
    })

    // vector * matrix
<<<<<<< HEAD
    assert.throws(function () {
=======
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      multiply(
        [1, 1, 1],
        [
          [1, 1],
          [1, 1]
        ]
      )
    })
  })

<<<<<<< HEAD
  it('should throw an error when multiplying multi dimensional matrices', function () {
    assert.throws(function () {
      multiply([[[1]]], [1])
    })
    assert.throws(function () {
      multiply([[[1]]], [[1]])
    })
    assert.throws(function () {
      multiply([1], [[[1]]])
    })
    assert.throws(function () {
=======
  it('should throw an error when multiplying multi dimensional matrices', function (): void {
    assert.throws(function (): void {
      multiply([[[1]]], [1])
    })
    assert.throws(function (): void {
      multiply([[[1]]], [[1]])
    })
    assert.throws(function (): void {
      multiply([1], [[[1]]])
    })
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      multiply([[1]], [[[1]]])
    })
  })

<<<<<<< HEAD
  it('should throw an error in case of invalid number of arguments', function () {
    assert.throws(function () {
=======
  it('should throw an error in case of invalid number of arguments', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      multiply(1)
    }, /TypeError: Too few arguments/)
  })

<<<<<<< HEAD
  it('should throw an in case of wrong type of arguments', function () {
    assert.throws(function () {
=======
  it('should throw an in case of wrong type of arguments', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      multiply(2, null)
    }, /TypeError: Unexpected type of argument/)
  })

<<<<<<< HEAD
  describe('Vector', function () {
    it('should multiply vectors correctly (dot product)', function () {
=======
  describe('Vector', function (): void {
    it('should multiply vectors correctly (dot product)', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      const a = [1, 2, 3]
      const b = [4, 5, 6]

      approxDeepEqual(multiply(a, b), 32)
      approxDeepEqual(multiply(matrix(a), matrix(b)), 32)
    })

<<<<<<< HEAD
    it('should multiply vectors with units correctly (dot product)', function () {
=======
    it('should multiply vectors with units correctly (dot product)', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      const a = [1, 2, 3]
      const b = [unit('4cm'), unit('5cm'), unit('6cm')]

      approxDeepEqual(multiply(a, b), unit('32cm'))
      approxDeepEqual(multiply(matrix(a), matrix(b)), unit('32cm'))

      const e = [unit('1cm'), unit('2cm'), unit('3cm')]

      assert.strictEqual(multiply(e, b).format(5), '32 cm^2')
      assert.strictEqual(multiply(matrix(e), matrix(b)).format(5), '32 cm^2')
    })

<<<<<<< HEAD
    it('should conjugate the first argument in dot product', function () {
=======
    it('should conjugate the first argument in dot product', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      const a = [complex(1, 2), complex(3, 4)]
      const b = [complex(5, 6), complex(7, 8)]

      approxDeepEqual(multiply(a, b), complex(70, -8))
      approxDeepEqual(multiply(matrix(a), matrix(b)), complex(70, -8))
    })

<<<<<<< HEAD
    it('should multiply row vector x column vector', function () {
=======
    it('should multiply row vector x column vector', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      const v = [[1, 2, 3, 0, 0, 5, 6]]

      let r = multiply(v, [[3], [4], [6], [0], [1], [2], [0]])
      assert.deepStrictEqual(r, [[39]])

      r = multiply(v, math.matrix([[3], [4], [6], [0], [1], [2], [0]], 'dense'))
      assert.deepStrictEqual(r, math.matrix([[39]], 'dense'))

      r = multiply(
        v,
        math.matrix([[3], [4], [6], [0], [1], [2], [0]], 'sparse')
      )
      assert.deepStrictEqual(r, math.matrix([[39]], 'sparse'))
    })

<<<<<<< HEAD
    it('should multiply dense row vector x column vector', function () {
=======
    it('should multiply dense row vector x column vector', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      const v = math.matrix([[1, 2, 3, 0, 0, 5, 6]], 'dense')

      let r = multiply(v, [[3], [4], [6], [0], [1], [2], [0]])
      assert.deepStrictEqual(r, math.matrix([[39]]))

      r = multiply(v, math.matrix([[3], [4], [6], [0], [1], [2], [0]], 'dense'))
      assert.deepStrictEqual(r, math.matrix([[39]]))

      r = multiply(
        v,
        math.matrix([[3], [4], [6], [0], [1], [2], [0]], 'sparse')
      )
      assert.deepStrictEqual(r, math.matrix([[39]], 'sparse'))
    })

<<<<<<< HEAD
    it('should throw an error when multiplying empty vectors', function () {
      assert.throws(function () {
=======
    it('should throw an error when multiplying empty vectors', function (): void {
      assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
        multiply([], [])
      }, /Cannot multiply two empty vectors/)
    })

<<<<<<< HEAD
    it('should multiply a vector with a matrix correctly', function () {
=======
    it('should multiply a vector with a matrix correctly', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      const a = [1, 2, 3]
      const b = [
        [8, 1, 6],
        [3, 5, 7],
        [4, 9, 2]
      ]

      approxDeepEqual(multiply(a, b), [26, 38, 26])
      approxDeepEqual(multiply(b, a), [28, 34, 28])

      approxDeepEqual(multiply(matrix(a), matrix(b)), matrix([26, 38, 26]))
      approxDeepEqual(multiply(matrix(b), matrix(a)), matrix([28, 34, 28]))
    })
  })

<<<<<<< HEAD
  describe('Dense Matrix', function () {
    it('should multiply matrix x scalar', function () {
=======
  describe('Dense Matrix', function (): void {
    it('should multiply matrix x scalar', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      const m = math.matrix([
        [2, 0],
        [4, 0]
      ])

      let r = multiply(m, 3)
      assert.deepStrictEqual(r._size, m._size)
      assert.deepStrictEqual(r._data, [
        [6, 0],
        [12, 0]
      ])

      r = multiply(m, math.complex(3, 3))
      assert.deepStrictEqual(r._size, m._size)
      assert.deepStrictEqual(r._data, [
        [math.complex(6, 6), math.complex(0, 0)],
        [math.complex(12, 12), math.complex(0, 0)]
      ])

      r = multiply(m, math.bignumber(3))
      assert.deepStrictEqual(r._size, m._size)
      assert.deepStrictEqual(r._data, [
        [math.bignumber(6), math.bignumber(0)],
        [math.bignumber(12), math.bignumber(0)]
      ])

      r = multiply(m, true)
      assert.deepStrictEqual(r._size, m._size)
      assert.deepStrictEqual(r._data, [
        [2, 0],
        [4, 0]
      ])

      r = multiply(m, false)
      assert.deepStrictEqual(r._size, m._size)
      assert.deepStrictEqual(r._data, [
        [0, 0],
        [0, 0]
      ])
    })

<<<<<<< HEAD
    it('should multiply matrix x matrix with zeros', function () {
=======
    it('should multiply matrix x matrix with zeros', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      const m = math.matrix([
        [2, 0],
        [4, 0]
      ])

      let r = multiply(
        m,
        math.matrix([
          [2, 0],
          [4, 0]
        ])
      )
      assert.deepStrictEqual(r.valueOf(), [
        [4, 0],
        [8, 0]
      ])

      r = multiply(
        m,
        math.matrix(
          [
            [2, 0],
            [4, 0]
          ],
          'sparse'
        )
      )
      assert.deepStrictEqual(r.valueOf(), [
        [4, 0],
        [8, 0]
      ])
    })

<<<<<<< HEAD
    it('should multiply matrix x matrix', function () {
=======
    it('should multiply matrix x matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      const m = math.matrix(
        [
          [1, 2],
          [3, 4]
        ],
        'dense'
      )

      let r = multiply(
        m,
        math.matrix(
          [
            [5, 6],
            [7, 8]
          ],
          'sparse'
        )
      )
      assert.deepStrictEqual(r.valueOf(), [
        [19, 22],
        [43, 50]
      ])

      r = multiply(
        m,
        math.matrix(
          [
            [5, 6],
            [7, 8]
          ],
          'dense'
        )
      )
      assert.deepStrictEqual(r.valueOf(), [
        [19, 22],
        [43, 50]
      ])
    })

    it('should multiply matrix x matrix, number datatype', function () {
      const m1 = math.matrix(
        [
          [1, 2],
          [3, 4]
        ],
        'dense',
        'number'
      )
      const m2 = math.matrix(
        [
          [5, 6],
          [7, 8]
        ],
        'dense',
        'number'
      )

      const r = multiply(m1, m2)
      assert(r.datatype() === 'number')
      assert.deepStrictEqual(r.valueOf(), [
        [19, 22],
        [43, 50]
      ])
    })

<<<<<<< HEAD
    it('should multiply matrix x array', function () {
=======
    it('should multiply matrix x array', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      const m = math.matrix([
        [2, 0],
        [4, 0]
      ])

      let r = multiply(m, [
        [2, 0],
        [4, 0]
      ])
      assert.deepStrictEqual(r.valueOf(), [
        [4, 0],
        [8, 0]
      ])

      r = multiply(m, [
        [2, 0, 1],
        [4, 0, 1]
      ])
      assert.deepStrictEqual(r.valueOf(), [
        [4, 0, 2],
        [8, 0, 4]
      ])
    })

<<<<<<< HEAD
    it('should multiply matrix x vector array', function () {
=======
    it('should multiply matrix x vector array', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      const m = math.matrix([
        [2, 0],
        [4, 0]
      ])

      const r = multiply(m, [[2], [4]])
      assert.deepStrictEqual(r.valueOf(), [[4], [8]])
    })

<<<<<<< HEAD
    it('should NOT squeeze scalar results of matrix * matrix', function () {
=======
    it('should NOT squeeze scalar results of matrix * matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      const a = math.matrix([[1, 2, 3]])
      const b = math.matrix([[4], [5], [6]])
      assert.deepStrictEqual(multiply(a, b), math.matrix([[32]]))
    })

<<<<<<< HEAD
    it('should NOT squeeze scalar results of matrix * vector', function () {
=======
    it('should NOT squeeze scalar results of matrix * vector', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      const a = math.matrix([[1, 2, 3]])
      const b = [4, 5, 6]
      assert.deepStrictEqual(multiply(a, b), math.matrix([32]))
    })

<<<<<<< HEAD
    it('should throw an error when multiplying matrices with incompatible sizes', function () {
      // vector * vector
      assert.throws(function () {
=======
    it('should throw an error when multiplying matrices with incompatible sizes', function (): void {
      // vector * vector
      assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
        multiply(math.matrix([1, 1], 'dense'), [1, 1, 1])
      })

      // matrix * matrix
<<<<<<< HEAD
      assert.throws(function () {
        multiply(math.matrix([[1, 1]], 'dense'), [[1, 1]])
      })
      assert.throws(function () {
=======
      assert.throws(function (): void {
        multiply(math.matrix([[1, 1]], 'dense'), [[1, 1]])
      })
      assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
        multiply(math.matrix([[1, 1]], 'dense'), [
          [1, 1],
          [1, 1],
          [1, 1]
        ])
      })

      // matrix * vector
<<<<<<< HEAD
      assert.throws(function () {
=======
      assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
        multiply(
          math.matrix(
            [
              [1, 1],
              [1, 1]
            ],
            'dense'
          ),
          [1, 1, 1]
        )
      })

      // vector * matrix
<<<<<<< HEAD
      assert.throws(function () {
=======
      assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
        multiply(math.matrix([1, 1, 1], 'dense'), [
          [1, 1],
          [1, 1]
        ])
      })
    })

<<<<<<< HEAD
    it('should multiply triangular matrices', function () {
=======
    it('should multiply triangular matrices', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      const l = [
        [1, 0, 0, 0],
        [-0.5, 1, 0, 0],
        [0, -0.7, 1, 0],
        [0.0666667, -0.4, -0.5714286, 1]
      ]
      const u = [
        [240, -2700, 6480, -4200],
        [0, -150, 540, -420],
        [0, 0, -42, 56],
        [0, 0, 0, 4]
      ]

      const r = multiply(l, u)

      approxDeepEqual(r.valueOf(), [
        [240, -2700, 6480, -4200],
        [-120, 1200, -2700, 1680],
        [0, 105, -420, 350],
        [16, -120, 240, -140]
      ])
    })

    const a = matrix([
      [1, 2],
      [3, 4]
    ])
    const b = matrix([
      [5, 6],
      [7, 8]
    ])
    const c = matrix([[5], [6]])
    const d = matrix([[5, 6]])

<<<<<<< HEAD
    it('should perform element-wise multiplication if multiplying a matrix and a number', function () {
=======
    it('should perform element-wise multiplication if multiplying a matrix and a number', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      approxDeepEqual(
        multiply(a, 3),
        matrix([
          [3, 6],
          [9, 12]
        ])
      )
      approxDeepEqual(
        multiply(3, a),
        matrix([
          [3, 6],
          [9, 12]
        ])
      )
    })

<<<<<<< HEAD
    it('should perform matrix multiplication', function () {
=======
    it('should perform matrix multiplication', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      approxDeepEqual(
        multiply(a, b),
        matrix([
          [19, 22],
          [43, 50]
        ])
      )
      approxDeepEqual(multiply(a, c), matrix([[17], [39]]))
      approxDeepEqual(multiply(d, a), matrix([[23, 34]]))
      approxDeepEqual(multiply(d, b), matrix([[67, 78]]))
      approxDeepEqual(multiply(d, c), matrix([[61]]))
      approxDeepEqual(
        multiply(
          [
            [1, 2],
            [3, 4]
          ],
          [
            [5, 6],
            [7, 8]
          ]
        ),
        [
          [19, 22],
          [43, 50]
        ]
      )
      approxDeepEqual(multiply([1, 2, 3, 4], 2), [2, 4, 6, 8])
      approxDeepEqual(multiply(matrix([1, 2, 3, 4]), 2), matrix([2, 4, 6, 8]))
    })
  })

<<<<<<< HEAD
  describe('Sparse Matrix', function () {
    it('should multiply matrix x scalar', function () {
=======
  describe('Sparse Matrix', function (): void {
    it('should multiply matrix x scalar', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      const m = math.matrix(
        [
          [2, 0],
          [4, 0]
        ],
        'sparse'
      )

      let r = multiply(m, 3)
      assert.deepStrictEqual(r._size, m._size)
      assert.deepStrictEqual(r._values, [6, 12])
      assert.deepStrictEqual(r._index, m._index)
      assert.deepStrictEqual(r._ptr, m._ptr)

      r = multiply(m, math.complex(3, 3))
      assert.deepStrictEqual(r._size, m._size)
      assert.deepStrictEqual(r._values, [
        math.complex(6, 6),
        math.complex(12, 12)
      ])
      assert.deepStrictEqual(r._index, m._index)
      assert.deepStrictEqual(r._ptr, m._ptr)

      r = multiply(m, math.bignumber(3))
      assert.deepStrictEqual(r._size, m._size)
      assert.deepStrictEqual(r._values, [math.bignumber(6), math.bignumber(12)])
      assert.deepStrictEqual(r._index, m._index)
      assert.deepStrictEqual(r._ptr, m._ptr)

      r = multiply(m, true)
      assert.deepStrictEqual(r._size, m._size)
      assert.deepStrictEqual(r._values, [2, 4])
      assert.deepStrictEqual(r._index, m._index)
      assert.deepStrictEqual(r._ptr, m._ptr)

      r = multiply(m, false)
      assert.deepStrictEqual(r._size, m._size)
      assert.deepStrictEqual(r._values, [])
      assert.deepStrictEqual(r._index, [])
      assert.deepStrictEqual(r._ptr, [0, 0, 0])
    })

<<<<<<< HEAD
    it('should multiply matrix x matrix with zeros', function () {
=======
    it('should multiply matrix x matrix with zeros', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      const m = math.matrix(
        [
          [2, 0],
          [4, 0]
        ],
        'sparse'
      )

      let r = multiply(
        m,
        math.matrix(
          [
            [2, 0],
            [4, 0]
          ],
          'sparse'
        )
      )
      assert.deepStrictEqual(r.valueOf(), [
        [4, 0],
        [8, 0]
      ])

      r = multiply(
        m,
        math.matrix(
          [
            [2, 0],
            [4, 0]
          ],
          'dense'
        )
      )
      assert.deepStrictEqual(r.valueOf(), [
        [4, 0],
        [8, 0]
      ])
    })

<<<<<<< HEAD
    it('should multiply matrix x matrix', function () {
=======
    it('should multiply matrix x matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      const m = math.matrix(
        [
          [1, 2],
          [3, 4]
        ],
        'sparse'
      )

      let r = multiply(
        m,
        math.matrix(
          [
            [5, 6],
            [7, 8]
          ],
          'sparse'
        )
      )
      assert.deepStrictEqual(r.valueOf(), [
        [19, 22],
        [43, 50]
      ])

      r = multiply(
        m,
        math.matrix(
          [
            [5, 6],
            [7, 8]
          ],
          'dense'
        )
      )
      assert.deepStrictEqual(r.valueOf(), [
        [19, 22],
        [43, 50]
      ])
    })

    it('should multiply matrix x matrix, number datatype', function () {
      const m1 = math.matrix(
        [
          [1, 2],
          [3, 4]
        ],
        'sparse',
        'number'
      )
      const m2 = math.matrix(
        [
          [5, 6],
          [7, 8]
        ],
        'sparse',
        'number'
      )

      const r = multiply(m1, m2)
      assert(r.datatype() === 'number')
      assert.deepStrictEqual(r.valueOf(), [
        [19, 22],
        [43, 50]
      ])
    })

<<<<<<< HEAD
    it('should multiply matrix x array', function () {
=======
    it('should multiply matrix x array', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      const m = math.matrix(
        [
          [2, 0],
          [4, 0]
        ],
        'sparse'
      )

      let r = multiply(m, [
        [2, 0],
        [4, 0]
      ])
      assert.deepStrictEqual(r.valueOf(), [
        [4, 0],
        [8, 0]
      ])

      r = multiply(m, [
        [2, 0, 1],
        [4, 0, 1]
      ])
      assert.deepStrictEqual(r.valueOf(), [
        [4, 0, 2],
        [8, 0, 4]
      ])
    })

<<<<<<< HEAD
    it('should multiply matrix x vector array', function () {
=======
    it('should multiply matrix x vector array', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      const m = math.matrix(
        [
          [2, 0],
          [4, 0]
        ],
        'sparse'
      )

      const r = multiply(m, [[2], [4]])
      assert.deepStrictEqual(r.valueOf(), [[4], [8]])
    })

<<<<<<< HEAD
    it('should NOT squeeze scalar results of matrix * matrix', function () {
=======
    it('should NOT squeeze scalar results of matrix * matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      const a = math.matrix([[1, 2, 3]], 'sparse')
      const b = math.matrix([[4], [5], [6]], 'sparse')
      assert.deepStrictEqual(multiply(a, b), math.matrix([[32]], 'sparse'))
    })

<<<<<<< HEAD
    it('should NOT squeeze scalar results of matrix * vector', function () {
=======
    it('should NOT squeeze scalar results of matrix * vector', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      const a = math.matrix([[1, 2, 3]], 'sparse')
      const b = [4, 5, 6]
      assert.deepStrictEqual(multiply(a, b), math.matrix([32], 'sparse'))
    })

<<<<<<< HEAD
    it('should throw an error when multiplying matrices with incompatible sizes', function () {
      // vector * vector
      assert.throws(function () {
=======
    it('should throw an error when multiplying matrices with incompatible sizes', function (): void {
      // vector * vector
      assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
        math.matrix([1, 1], 'sparse').multiply([1, 1, 1])
      })

      // matrix * matrix
<<<<<<< HEAD
      assert.throws(function () {
        math.matrix([[1, 1]], 'sparse').multiply([[1, 1]])
      })
      assert.throws(function () {
=======
      assert.throws(function (): void {
        math.matrix([[1, 1]], 'sparse').multiply([[1, 1]])
      })
      assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
        math.matrix([[1, 1]], 'sparse').multiply([
          [1, 1],
          [1, 1],
          [1, 1]
        ])
      })

      // matrix * vector
<<<<<<< HEAD
      assert.throws(function () {
=======
      assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
        math
          .matrix(
            [
              [1, 1],
              [1, 1]
            ],
            'sparse'
          )
          .multiply([1, 1, 1])
      })

      // vector * matrix
<<<<<<< HEAD
      assert.throws(function () {
=======
      assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
        math.matrix([1, 1, 1], 'sparse').multiply([
          [1, 1],
          [1, 1]
        ])
      })
    })

<<<<<<< HEAD
    it('should multiply triangular matrices', function () {
=======
    it('should multiply triangular matrices', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      const l = math.matrix(
        [
          [1, 0, 0, 0],
          [-0.5, 1, 0, 0],
          [0, -0.7, 1, 0],
          [0.0666667, -0.4, -0.5714286, 1]
        ],
        'sparse'
      )
      const u = math.matrix(
        [
          [240, -2700, 6480, -4200],
          [0, -150, 540, -420],
          [0, 0, -42, 56],
          [0, 0, 0, 4]
        ],
        'sparse'
      )

      const r = multiply(l, u)

      assert(r.storage(), 'sparse')
      approxDeepEqual(r.valueOf(), [
        [240, -2700, 6480, -4200],
        [-120, 1200, -2700, 1680],
        [0, 105, -420, 350],
        [16, -120, 240, -140]
      ])
    })

    const a = matrix(
      [
        [1, 2],
        [3, 4]
      ],
      'sparse'
    )
    const b = matrix(
      [
        [5, 6],
        [7, 8]
      ],
      'sparse'
    )
    const c = matrix([[5], [6]], 'sparse')
    const d = matrix([[5, 6]], 'sparse')

<<<<<<< HEAD
    it('should perform element-wise multiplication if multiplying a matrix and a number', function () {
=======
    it('should perform element-wise multiplication if multiplying a matrix and a number', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      approxDeepEqual(
        multiply(a, 3),
        matrix(
          [
            [3, 6],
            [9, 12]
          ],
          'sparse'
        )
      )
      approxDeepEqual(
        multiply(3, a),
        matrix(
          [
            [3, 6],
            [9, 12]
          ],
          'sparse'
        )
      )
    })

<<<<<<< HEAD
    it('should perform matrix multiplication', function () {
=======
    it('should perform matrix multiplication', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      approxDeepEqual(
        multiply(a, b),
        matrix(
          [
            [19, 22],
            [43, 50]
          ],
          'sparse'
        )
      )
      approxDeepEqual(multiply(a, c), matrix([[17], [39]], 'sparse'))
      approxDeepEqual(multiply(d, a), matrix([[23, 34]], 'sparse'))
      approxDeepEqual(multiply(d, b), matrix([[67, 78]], 'sparse'))
      approxDeepEqual(multiply(d, c), matrix([[61]], 'sparse'))
    })

<<<<<<< HEAD
    it('should multiply two pattern matrices correctly', function () {
=======
    it('should multiply two pattern matrices correctly', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      const a = new math.SparseMatrix({
        values: undefined,
        index: [0, 1, 2, 0],
        ptr: [0, 2, 3, 4],
        size: [3, 3]
      })

      const b = new math.SparseMatrix({
        values: undefined,
        index: [0, 1, 2, 1],
        ptr: [0, 3, 3, 4],
        size: [3, 3]
      })

      const c = multiply(a, b)

      assert.deepStrictEqual(c.valueOf(), [
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 1]
      ])
    })

<<<<<<< HEAD
    it('should multiply pattern and value matrices correctly', function () {
=======
    it('should multiply pattern and value matrices correctly', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      const a = new math.SparseMatrix({
        values: undefined,
        index: [0, 1, 2, 0],
        ptr: [0, 2, 3, 4],
        size: [3, 3]
      })

      const b = new math.SparseMatrix({
        values: [1, 2, 3, 4],
        index: [0, 1, 2, 1],
        ptr: [0, 3, 3, 4],
        size: [3, 3]
      })

      const c = multiply(a, b)

      assert.deepStrictEqual(c.valueOf(), [
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 1]
      ])
    })

<<<<<<< HEAD
    it('should multiply value and pattern matrices correctly', function () {
=======
    it('should multiply value and pattern matrices correctly', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      const a = new math.SparseMatrix({
        values: [1, 2, 3, 4],
        index: [0, 1, 2, 0],
        ptr: [0, 2, 3, 4],
        size: [3, 3]
      })

      const b = new math.SparseMatrix({
        values: undefined,
        index: [0, 1, 2, 1],
        ptr: [0, 3, 3, 4],
        size: [3, 3]
      })

      const c = multiply(a, b)

      assert.deepStrictEqual(c.valueOf(), [
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 1]
      ])
    })
  })

<<<<<<< HEAD
  describe('multiple arguments', function () {
    it('should multiply more than two arguments', function () {
=======
  describe('multiple arguments', function (): void {
    it('should multiply more than two arguments', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(multiply(2, 3, 4), 24)
      assert.deepStrictEqual(multiply(2, 3, [5, 6]), [30, 36])

      assert.deepStrictEqual(
        multiply(
          [
            [2, 2],
            [2, 2]
          ],
          [
            [3, 3],
            [3, 3]
          ],
          [
            [4, 4],
            [4, 4]
          ]
        ),
        [
          [96, 96],
          [96, 96]
        ]
      )
      assert.deepStrictEqual(
        multiply(
          [
            [2, 2],
            [2, 2]
          ],
          [
            [3, 3],
            [3, 3]
          ],
          4
        ),
        [
          [48, 48],
          [48, 48]
        ]
      )
      assert.deepStrictEqual(
        multiply(
          [
            [2, 2],
            [2, 2]
          ],
          3,
          4
        ),
        [
          [24, 24],
          [24, 24]
        ]
      )

      assert.deepStrictEqual(
        multiply(
          math.matrix([
            [2, 2],
            [2, 2]
          ]),
          math.matrix([
            [3, 3],
            [3, 3]
          ]),
          math.matrix([
            [4, 4],
            [4, 4]
          ])
        ),
        math.matrix([
          [96, 96],
          [96, 96]
        ])
      )
      assert.deepStrictEqual(
        multiply(
          math.matrix([
            [2, 2],
            [2, 2]
          ]),
          math.matrix([
            [3, 3],
            [3, 3]
          ]),
          4
        ),
        math.matrix([
          [48, 48],
          [48, 48]
        ])
      )
      assert.deepStrictEqual(
        multiply(
          math.matrix([
            [2, 2],
            [2, 2]
          ]),
          3,
          4
        ),
        math.matrix([
          [24, 24],
          [24, 24]
        ])
      )
    })
  })

<<<<<<< HEAD
  describe('immutable operations', function () {
    it('should not mutate the input (arrays)', function () {
=======
  describe('immutable operations', function (): void {
    it('should not mutate the input (arrays)', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      const a = Object.freeze([
        [1, 2],
        [3, 4]
      ])
      const b = Object.freeze([
        [5, 6],
        [7, 8]
      ])

      assert.deepStrictEqual(multiply(a, b), [
        [19, 22],
        [43, 50]
      ])
      assert.deepStrictEqual(a, [
        [1, 2],
        [3, 4]
      ])
      assert.deepStrictEqual(b, [
        [5, 6],
        [7, 8]
      ])
    })

<<<<<<< HEAD
    it('should not mutate the input (arrays with nested Matrices)', function () {
=======
    it('should not mutate the input (arrays with nested Matrices)', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      const a = Object.freeze([math.matrix([1, 2]), math.matrix([3, 4])])
      const b = Object.freeze([math.matrix([5, 6]), math.matrix([7, 8])])

      assert.deepStrictEqual(multiply(a, b), [
        [19, 22],
        [43, 50]
      ])
      assert.deepStrictEqual(a, [math.matrix([1, 2]), math.matrix([3, 4])])
      assert.deepStrictEqual(b, [math.matrix([5, 6]), math.matrix([7, 8])])
    })
  })

<<<<<<< HEAD
  it('should LaTeX multiply', function () {
=======
  it('should LaTeX multiply', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const expression = math.parse('multiply(2,3)')
    assert.strictEqual(expression.toTex(), '\\left(2\\cdot3\\right)')
  })
})
