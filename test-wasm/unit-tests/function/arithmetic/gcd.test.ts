<<<<<<< HEAD
// @ts-nocheck
// test gcd
=======
/**
 * Test for gcd - AssemblyScript-friendly TypeScript
 */
>>>>>>> claude/review-sprints-quality-checks-Rlfec
import assert from 'assert'
import { ArgumentsError } from '../../../../src/error/ArgumentsError.js'

import math from '../../../../src/defaultInstance.ts'
<<<<<<< HEAD
=======
interface MathNode {
  type: string
  toTex(): string
}

>>>>>>> claude/review-sprints-quality-checks-Rlfec
const matrix = math.matrix
const sparse = math.sparse
const gcd = math.gcd

<<<<<<< HEAD
describe('gcd', function () {
  it('should find the greatest common divisor of two or more numbers', function () {
=======
describe('gcd', function (): void {
  it('should find the greatest common divisor of two or more numbers', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(gcd(12, 8), 4)
    assert.strictEqual(gcd(8, 12), 4)
    assert.strictEqual(gcd(8, -12), 4)
    assert.strictEqual(gcd(-12, 8), 4)
    assert.strictEqual(gcd(12, -8), 4)
    assert.strictEqual(gcd(15, 3), 3)
    assert.strictEqual(gcd(25, 15, -10, 30), 5)
  })

<<<<<<< HEAD
  it('should find the greatest common divisor of two or more numbers with 1d array argument', function () {
=======
  it('should find the greatest common divisor of two or more numbers with 1d array argument', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(gcd([12, 8]), 4)
    assert.strictEqual(gcd([25, 15, -10, 30]), 5)
  })

<<<<<<< HEAD
  it('should find the greatest common divisor of two or more numbers with 1d array argument', function () {
=======
  it('should find the greatest common divisor of two or more numbers with 1d array argument', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(gcd([[12, 8]]), 4)
    assert.strictEqual(gcd([[25, 15, -10, 30]]), 5)
  })

<<<<<<< HEAD
  it('should throw exception on multi dimensional array argument', function () {
    assert.throws(() => gcd([[1], [2]]), ArgumentsError)
  })

  it('should find the greatest common divisor of two or more numbers with 1d matrix argument', function () {
=======
  it('should throw exception on multi dimensional array argument', function (): void {
    assert.throws(() => gcd([[1], [2]]), ArgumentsError)
  })

  it('should find the greatest common divisor of two or more numbers with 1d matrix argument', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(gcd(matrix([12, 8])), 4)
    assert.strictEqual(gcd(matrix([25, 15, -10, 30])), 5)
  })

<<<<<<< HEAD
  it('should find the greatest common divisor of two or more numbers with nested 1d matrix argument', function () {
=======
  it('should find the greatest common divisor of two or more numbers with nested 1d matrix argument', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(gcd(matrix([[12, 8]])), 4)
    assert.strictEqual(gcd(matrix([[25, 15, -10, 30]])), 5)
  })

<<<<<<< HEAD
  it('should throw exception on multi dimensional matrix argument', function () {
    assert.throws(() => gcd(matrix([[1], [2]])), ArgumentsError)
  })

  it('should calculate gcd for edge cases around zero', function () {
=======
  it('should throw exception on multi dimensional matrix argument', function (): void {
    assert.throws(() => gcd(matrix([[1], [2]])), ArgumentsError)
  })

  it('should calculate gcd for edge cases around zero', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(gcd(3, 0), 3)
    assert.strictEqual(gcd(-3, 0), 3)
    assert.strictEqual(gcd(0, 3), 3)
    assert.strictEqual(gcd(0, -3), 3)
    assert.strictEqual(gcd(0, 0), 0)

    assert.strictEqual(gcd(1, 1), 1)
    assert.strictEqual(gcd(1, 0), 1)
    assert.strictEqual(gcd(1, -1), 1)
    assert.strictEqual(gcd(-1, 1), 1)
    assert.strictEqual(gcd(-1, 0), 1)
    assert.strictEqual(gcd(-1, -1), 1)
    assert.strictEqual(gcd(0, 1), 1)
    assert.strictEqual(gcd(0, -1), 1)
    assert.strictEqual(gcd(0, 0), 0)
  })

<<<<<<< HEAD
  it('should calculate gcd for edge cases with negative values', function () {
=======
  it('should calculate gcd for edge cases with negative values', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(1, gcd(2, 5))
    assert.deepStrictEqual(1, gcd(2, -5))
    assert.deepStrictEqual(1, gcd(-2, 5))
    assert.deepStrictEqual(1, gcd(-2, -5))

    assert.deepStrictEqual(2, gcd(2, 6))
    assert.deepStrictEqual(2, gcd(2, -6))
    assert.deepStrictEqual(2, gcd(-2, 6))
    assert.deepStrictEqual(2, gcd(-2, -6))
  })

<<<<<<< HEAD
  it('should calculate gcd for BigNumbers', function () {
=======
  it('should calculate gcd for BigNumbers', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(
      gcd(math.bignumber(12), math.bignumber(8)),
      math.bignumber(4)
    )
    assert.deepStrictEqual(
      gcd(math.bignumber(8), math.bignumber(12)),
      math.bignumber(4)
    )
  })

<<<<<<< HEAD
  it('should calculate gcd for mixed BigNumbers and Numbers', function () {
=======
  it('should calculate gcd for mixed BigNumbers and Numbers', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(gcd(math.bignumber(12), 8), math.bignumber(4))
    assert.deepStrictEqual(gcd(8, math.bignumber(12)), math.bignumber(4))
  })

<<<<<<< HEAD
  it('should find the greatest common divisor of fractions', function () {
=======
  it('should find the greatest common divisor of fractions', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const a = math.fraction(5, 8)
    assert.strictEqual(gcd(a, math.fraction(3, 7)).toString(), '0.017(857142)')
    assert.strictEqual(a.toString(), '0.625')
  })

<<<<<<< HEAD
  it('should find the greatest common divisor of mixed numbers and fractions', function () {
=======
  it('should find the greatest common divisor of mixed numbers and fractions', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(gcd(math.fraction(12), 8), math.fraction(4))
    assert.deepStrictEqual(gcd(12, math.fraction(8)), math.fraction(4))
  })

<<<<<<< HEAD
  it('should find the greatest common divisor of booleans', function () {
=======
  it('should find the greatest common divisor of booleans', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(gcd(true, true), 1)
    assert.strictEqual(gcd(true, false), 1)
    assert.strictEqual(gcd(false, true), 1)
    assert.strictEqual(gcd(false, false), 0)
  })

<<<<<<< HEAD
  it('should throw an error if only one argument', function () {
    assert.throws(function () {
=======
  it('should throw an error if only one argument', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      gcd(1)
    }, /TypeError: Too few arguments/)
  })

<<<<<<< HEAD
  it('should throw an error for non-integer numbers', function () {
    assert.throws(function () {
      gcd(2, 4.1)
    }, /Parameters in function gcd must be integer numbers/)
    assert.throws(function () {
=======
  it('should throw an error for non-integer numbers', function (): void {
    assert.throws(function (): void {
      gcd(2, 4.1)
    }, /Parameters in function gcd must be integer numbers/)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      gcd(2.3, 4)
    }, /Parameters in function gcd must be integer numbers/)
  })

<<<<<<< HEAD
  it('should throw an error with complex numbers', function () {
    assert.throws(function () {
=======
  it('should throw an error with complex numbers', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      gcd(math.complex(1, 3), 2)
    }, /TypeError: Unexpected type of argument/)
  })

<<<<<<< HEAD
  it('should convert strings to numbers', function () {
=======
  it('should convert strings to numbers', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(gcd('12', '8'), 4)
    assert.strictEqual(gcd(12, '8'), 4)
    assert.strictEqual(gcd('12', 8), 4)

<<<<<<< HEAD
    assert.throws(function () {
=======
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      gcd('a', 8)
    }, /Cannot convert "a" to a number/)
  })

<<<<<<< HEAD
  it('should throw an error with units', function () {
    assert.throws(function () {
=======
  it('should throw an error with units', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      gcd(math.unit('5cm'), 2)
    }, /TypeError: Unexpected type of argument/)
  })

<<<<<<< HEAD
  describe('Array', function () {
    it('should find the greatest common divisor array - scalar', function () {
=======
  describe('Array', function (): void {
    it('should find the greatest common divisor array - scalar', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(gcd([5, 18, 3], 3), [1, 3, 3])
      assert.deepStrictEqual(gcd(3, [5, 18, 3]), [1, 3, 3])
    })

<<<<<<< HEAD
    it('should find the greatest common divisor between broadcastable arrays', function () {
=======
    it('should find the greatest common divisor between broadcastable arrays', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(gcd([5, 18, 3], [[3], [2], [1]]), [
        [1, 3, 3],
        [1, 2, 1],
        [1, 1, 1]
      ])
      assert.deepStrictEqual(gcd([[5], [18], [3]], [3, 2, 1]), [
        [1, 1, 1],
        [3, 2, 1],
        [3, 1, 1]
      ])
    })

<<<<<<< HEAD
    it('should find the greatest common divisor array - array', function () {
      assert.deepStrictEqual(gcd([5, 2, 3], [25, 3, 6]), [5, 1, 3])
    })

    it('should find the greatest common divisor array - dense matrix', function () {
=======
    it('should find the greatest common divisor array - array', function (): void {
      assert.deepStrictEqual(gcd([5, 2, 3], [25, 3, 6]), [5, 1, 3])
    })

    it('should find the greatest common divisor array - dense matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        gcd([5, 2, 3], matrix([25, 3, 6])),
        matrix([5, 1, 3])
      )
    })

<<<<<<< HEAD
    it('should find the greatest common divisor array - sparse matrix', function () {
=======
    it('should find the greatest common divisor array - sparse matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        gcd(
          [
            [5, 2, 3],
            [3, 2, 5]
          ],
          sparse([
            [0, 3, 6],
            [6, 0, 25]
          ])
        ),
        matrix([
          [5, 1, 3],
          [3, 2, 5]
        ])
      )
    })
  })

<<<<<<< HEAD
  describe('DenseMatrix', function () {
    it('should find the greatest common divisor dense matrix - scalar', function () {
=======
  describe('DenseMatrix', function (): void {
    it('should find the greatest common divisor dense matrix - scalar', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(gcd(matrix([5, 18, 3]), 3), matrix([1, 3, 3]))
      assert.deepStrictEqual(gcd(3, matrix([5, 18, 3])), matrix([1, 3, 3]))
    })

<<<<<<< HEAD
    it('should find the greatest common divisor dense matrix - array', function () {
=======
    it('should find the greatest common divisor dense matrix - array', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        gcd(matrix([5, 2, 3]), [25, 3, 6]),
        matrix([5, 1, 3])
      )
    })

<<<<<<< HEAD
    it('should find the greatest common divisor dense matrix - dense matrix', function () {
=======
    it('should find the greatest common divisor dense matrix - dense matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        gcd(matrix([5, 2, 3]), matrix([25, 3, 6])),
        matrix([5, 1, 3])
      )
    })

<<<<<<< HEAD
    it('should find the greatest common divisor dense matrix - sparse matrix', function () {
=======
    it('should find the greatest common divisor dense matrix - sparse matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        gcd(
          matrix([
            [5, 2, 3],
            [3, 2, 5]
          ]),
          sparse([
            [0, 3, 6],
            [6, 0, 25]
          ])
        ),
        matrix([
          [5, 1, 3],
          [3, 2, 5]
        ])
      )
    })
  })

<<<<<<< HEAD
  describe('SparseMatrix', function () {
    it('should find the greatest common divisor sparse matrix - scalar', function () {
=======
  describe('SparseMatrix', function (): void {
    it('should find the greatest common divisor sparse matrix - scalar', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        gcd(
          sparse([
            [5, 0, 3],
            [0, 18, 0]
          ]),
          3
        ),
        matrix([
          [1, 3, 3],
          [3, 3, 3]
        ])
      )
      assert.deepStrictEqual(
        gcd(
          3,
          sparse([
            [5, 0, 3],
            [0, 18, 0]
          ])
        ),
        matrix([
          [1, 3, 3],
          [3, 3, 3]
        ])
      )
    })

<<<<<<< HEAD
    it('should find the greatest common divisor sparse matrix - array', function () {
=======
    it('should find the greatest common divisor sparse matrix - array', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        gcd(
          sparse([
            [5, 2, 3],
            [3, 2, 5]
          ]),
          [
            [0, 3, 6],
            [6, 0, 25]
          ]
        ),
        matrix([
          [5, 1, 3],
          [3, 2, 5]
        ])
      )
    })

<<<<<<< HEAD
    it('should find the greatest common divisor sparse matrix - dense matrix', function () {
=======
    it('should find the greatest common divisor sparse matrix - dense matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        gcd(
          sparse([
            [5, 2, 3],
            [3, 2, 5]
          ]),
          matrix([
            [0, 3, 6],
            [6, 0, 25]
          ])
        ),
        matrix([
          [5, 1, 3],
          [3, 2, 5]
        ])
      )
    })

<<<<<<< HEAD
    it('should find the greatest common divisor sparse matrix - sparse matrix', function () {
=======
    it('should find the greatest common divisor sparse matrix - sparse matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        gcd(
          sparse([
            [5, 2, 3],
            [3, 2, 5]
          ]),
          sparse([
            [0, 3, 6],
            [6, 0, 25]
          ])
        ),
        sparse([
          [5, 1, 3],
          [3, 2, 5]
        ])
      )
    })
  })

<<<<<<< HEAD
  it('should LaTeX gcd', function () {
=======
  it('should LaTeX gcd', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const expression = math.parse('gcd(2,3)')
    assert.strictEqual(expression.toTex(), '\\gcd\\left(2,3\\right)')
  })
})
