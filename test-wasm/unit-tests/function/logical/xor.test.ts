<<<<<<< HEAD
// @ts-nocheck
// test xor
import assert from 'assert'

import math from '../../../../src/defaultInstance.ts'
=======
/**
 * Test for xor - AssemblyScript-friendly TypeScript
 */
import assert from 'assert'

import math from '../../../../src/defaultInstance.ts'

interface MathNode {
  type: string
  toTex(): string
}
>>>>>>> claude/review-sprints-quality-checks-Rlfec
const bignumber = math.bignumber
const complex = math.complex
const matrix = math.matrix
const sparse = math.sparse
const unit = math.unit
const xor = math.xor

<<<<<<< HEAD
describe('xor', function () {
  it('should xor two numbers correctly', function () {
=======
describe('xor', function (): void {
  it('should xor two numbers correctly', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(xor(1, 1), false)
    assert.strictEqual(xor(-1, 1), false)
    assert.strictEqual(xor(-1, -1), false)
    assert.strictEqual(xor(0, -1), true)
    assert.strictEqual(xor(1, 0), true)
    assert.strictEqual(xor(1, NaN), true)
    assert.strictEqual(xor(NaN, 1), true)
    assert.strictEqual(xor(1e10, 0.019209), false)
    assert.strictEqual(xor(-1.0e-100, 1.0e-100), false)
    assert.strictEqual(xor(Infinity, -Infinity), false)
    assert.strictEqual(xor(NaN, NaN), false)
    assert.strictEqual(xor(NaN, 0), false)
    assert.strictEqual(xor(0, NaN), false)
    assert.strictEqual(xor(0, 0), false)
  })

<<<<<<< HEAD
  it('should xor two complex numbers', function () {
=======
  it('should xor two complex numbers', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(xor(complex(1, 1), complex(1, 1)), false)
    assert.strictEqual(xor(complex(0, 1), complex(1, 1)), false)
    assert.strictEqual(xor(complex(1, 0), complex(1, 1)), false)
    assert.strictEqual(xor(complex(1, 1), complex(0, 1)), false)
    assert.strictEqual(xor(complex(1, 1), complex(1, 0)), false)
    assert.strictEqual(xor(complex(1, 0), complex(1, 0)), false)
    assert.strictEqual(xor(complex(0, 1), complex(0, 1)), false)
    assert.strictEqual(xor(complex(0, 0), complex(1, 1)), true)
    assert.strictEqual(xor(complex(0, 0), complex(0, 1)), true)
    assert.strictEqual(xor(complex(0, 0), complex(1, 0)), true)
    assert.strictEqual(xor(complex(1, 1), complex(0, 0)), true)
    assert.strictEqual(xor(complex(0, 1), complex(0, 0)), true)
    assert.strictEqual(xor(complex(1, 0), complex(0, 0)), true)
    assert.strictEqual(xor(complex(), complex(1, 1)), true)
    assert.strictEqual(xor(complex(0), complex(1, 1)), true)
    assert.strictEqual(xor(complex(1), complex(1, 1)), false)
    assert.strictEqual(xor(complex(1, 1), complex()), true)
    assert.strictEqual(xor(complex(1, 1), complex(0)), true)
    assert.strictEqual(xor(complex(1, 1), complex(1)), false)
    assert.strictEqual(xor(complex(0, 0), complex(0, 0)), false)
    assert.strictEqual(xor(complex(), complex()), false)
  })

<<<<<<< HEAD
  it('should xor mixed numbers and complex numbers', function () {
=======
  it('should xor mixed numbers and complex numbers', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(xor(complex(1, 1), 1), false)
    assert.strictEqual(xor(complex(1, 1), 0), true)
    assert.strictEqual(xor(1, complex(1, 1)), false)
    assert.strictEqual(xor(0, complex(1, 1)), true)
    assert.strictEqual(xor(complex(0, 0), 1), true)
    assert.strictEqual(xor(1, complex(0, 0)), true)
    assert.strictEqual(xor(0, complex(0, 0)), false)
    assert.strictEqual(xor(complex(0, 0), 0), false)
  })

<<<<<<< HEAD
  it('should xor two booleans', function () {
=======
  it('should xor two booleans', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(xor(true, true), false)
    assert.strictEqual(xor(true, false), true)
    assert.strictEqual(xor(false, true), true)
    assert.strictEqual(xor(false, false), false)
  })

<<<<<<< HEAD
  it('should xor mixed numbers and booleans', function () {
=======
  it('should xor mixed numbers and booleans', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(xor(2, true), false)
    assert.strictEqual(xor(2, false), true)
    assert.strictEqual(xor(0, true), true)
    assert.strictEqual(xor(true, 2), false)
    assert.strictEqual(xor(false, 2), true)
    assert.strictEqual(xor(false, 0), false)
  })

<<<<<<< HEAD
  it('should xor bignumbers', function () {
=======
  it('should xor bignumbers', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(xor(bignumber(1), bignumber(1)), false)
    assert.strictEqual(xor(bignumber(-1), bignumber(1)), false)
    assert.strictEqual(xor(bignumber(-1), bignumber(-1)), false)
    assert.strictEqual(xor(bignumber(0), bignumber(-1)), true)
    assert.strictEqual(xor(bignumber(1), bignumber(0)), true)
    assert.strictEqual(xor(bignumber(1), bignumber(NaN)), true)
    assert.strictEqual(xor(bignumber(NaN), bignumber(1)), true)
    assert.strictEqual(xor(bignumber('1e+10'), bignumber(0.19209)), false)
    assert.strictEqual(
      xor(bignumber('-1.0e-400'), bignumber('1.0e-400')),
      false
    )
    assert.strictEqual(xor(bignumber(Infinity), bignumber(-Infinity)), false)
    assert.strictEqual(xor(bignumber(NaN), bignumber(NaN)), false)
    assert.strictEqual(xor(bignumber(NaN), bignumber(0)), false)
    assert.strictEqual(xor(bignumber(0), bignumber(NaN)), false)
    assert.strictEqual(xor(bignumber(0), bignumber(0)), false)
  })

<<<<<<< HEAD
  it('should xor bigints', function () {
=======
  it('should xor bigints', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(xor(1n, 1n), false)
    assert.strictEqual(xor(-1n, 1n), false)
    assert.strictEqual(xor(-1n, -1n), false)
    assert.strictEqual(xor(0n, -1n), true)
    assert.strictEqual(xor(1n, 0n), true)
  })

<<<<<<< HEAD
  it('should xor mixed numbers and bignumbers', function () {
=======
  it('should xor mixed numbers and bignumbers', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(xor(bignumber(2), 3), false)
    assert.strictEqual(xor(2, bignumber(2)), false)
    assert.strictEqual(xor(0, bignumber(2)), true)
    assert.strictEqual(xor(2, bignumber(0)), true)
    assert.strictEqual(xor(bignumber(0), 2), true)
    assert.strictEqual(xor(bignumber(2), 0), true)
    assert.strictEqual(xor(bignumber(0), 0), false)
  })

<<<<<<< HEAD
  it('should xor mixed numbers and bigints', function () {
=======
  it('should xor mixed numbers and bigints', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(xor(2n, 3), false)
    assert.strictEqual(xor(0, 2n), true)
  })

<<<<<<< HEAD
  it('should xor two units', function () {
=======
  it('should xor two units', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(xor(unit('100cm'), unit('10inch')), false)
    assert.strictEqual(xor(unit('100cm'), unit('0 inch')), true)
    assert.strictEqual(xor(unit('0cm'), unit('1m')), true)
    assert.strictEqual(xor(unit('m'), unit('1m')), true)
    assert.strictEqual(xor(unit('1dm'), unit('m')), true)
    assert.strictEqual(xor(unit('-100cm'), unit('-10inch')), false)
    assert.strictEqual(xor(unit(5, 'km'), unit(100, 'gram')), false)
    assert.strictEqual(xor(unit(5, 'km'), unit(0, 'gram')), true)
    assert.strictEqual(xor(unit(0, 'km'), unit(100, 'gram')), true)
    assert.strictEqual(xor(unit(0, 'km'), unit(0, 'gram')), false)

    assert.strictEqual(
      xor(unit(bignumber(0), 'm'), unit(bignumber(0), 'm')),
      false
    )
    assert.strictEqual(
      xor(unit(bignumber(1), 'm'), unit(bignumber(0), 'm')),
      true
    )
    assert.strictEqual(
      xor(unit(bignumber(0), 'm'), unit(bignumber(1), 'm')),
      true
    )
    assert.strictEqual(
      xor(unit(bignumber(1), 'm'), unit(bignumber(1), 'm')),
      false
    )
  })

<<<<<<< HEAD
  it('should xor two arrays', function () {
=======
  it('should xor two arrays', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(xor([0, 1, 0, 12], [0, 0, 1, 22]), [
      false,
      true,
      true,
      false
    ])
    assert.deepStrictEqual(xor([], []), [])
  })

<<<<<<< HEAD
  describe('Array', function () {
    it('should xor array - scalar', function () {
=======
  describe('Array', function (): void {
    it('should xor array - scalar', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(xor(10, [0, 2]), [true, false])
      assert.deepStrictEqual(xor([0, 2], 10), [true, false])
    })

<<<<<<< HEAD
    it('should xor array - array', function () {
=======
    it('should xor array - array', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(xor([0, 1, 0, 12], [0, 0, 1, 22]), [
        false,
        true,
        true,
        false
      ])
      assert.deepStrictEqual(xor([], []), [])
    })

<<<<<<< HEAD
    it('should xor broadcastable arrays', function () {
=======
    it('should xor broadcastable arrays', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(xor([0, 1, 0, 12], [[0], [0], [1], [22]]), [
        [false, true, false, true],
        [false, true, false, true],
        [true, false, true, false],
        [true, false, true, false]
      ])
      assert.deepStrictEqual(xor([], []), [])
    })

<<<<<<< HEAD
    it('should xor array - dense matrix', function () {
=======
    it('should xor array - dense matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        xor([0, 1, 0, 12], matrix([0, 0, 1, 22])),
        matrix([false, true, true, false])
      )
      assert.deepStrictEqual(xor([], matrix([])), matrix([]))
    })

<<<<<<< HEAD
    it('should xor array - sparse matrix', function () {
=======
    it('should xor array - sparse matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        xor(
          [
            [0, 1],
            [0, 12]
          ],
          sparse([
            [0, 0],
            [1, 22]
          ])
        ),
        matrix([
          [false, true],
          [true, false]
        ])
      )
    })
  })

<<<<<<< HEAD
  describe('DenseMatrix', function () {
    it('should xor dense matrix - scalar', function () {
=======
  describe('DenseMatrix', function (): void {
    it('should xor dense matrix - scalar', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(xor(10, matrix([0, 2])), matrix([true, false]))
      assert.deepStrictEqual(xor(matrix([0, 2]), 10), matrix([true, false]))
    })

<<<<<<< HEAD
    it('should xor dense matrix - array', function () {
=======
    it('should xor dense matrix - array', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        xor(matrix([0, 1, 0, 12]), [0, 0, 1, 22]),
        matrix([false, true, true, false])
      )
      assert.deepStrictEqual(xor(matrix([]), []), matrix([]))
    })

<<<<<<< HEAD
    it('should xor dense matrix - dense matrix', function () {
=======
    it('should xor dense matrix - dense matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        xor(matrix([0, 1, 0, 12]), matrix([0, 0, 1, 22])),
        matrix([false, true, true, false])
      )
      assert.deepStrictEqual(xor(matrix([]), matrix([])), matrix([]))
    })

<<<<<<< HEAD
    it('should xor dense matrix - sparse matrix', function () {
=======
    it('should xor dense matrix - sparse matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        xor(
          matrix([
            [0, 1],
            [0, 12]
          ]),
          sparse([
            [0, 0],
            [1, 22]
          ])
        ),
        matrix([
          [false, true],
          [true, false]
        ])
      )
    })
  })

<<<<<<< HEAD
  describe('SparseMatrix', function () {
    it('should xor sparse matrix - scalar', function () {
=======
  describe('SparseMatrix', function (): void {
    it('should xor sparse matrix - scalar', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        xor(10, sparse([[0], [2]])),
        matrix([[true], [false]])
      )
      assert.deepStrictEqual(
        xor(sparse([[0], [2]]), 10),
        matrix([[true], [false]])
      )
    })

<<<<<<< HEAD
    it('should xor sparse matrix - array', function () {
=======
    it('should xor sparse matrix - array', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        xor(
          sparse([
            [0, 1],
            [0, 12]
          ]),
          [
            [0, 0],
            [1, 22]
          ]
        ),
        matrix([
          [false, true],
          [true, false]
        ])
      )
    })

<<<<<<< HEAD
    it('should xor sparse matrix - dense matrix', function () {
=======
    it('should xor sparse matrix - dense matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        xor(
          sparse([
            [0, 1],
            [0, 12]
          ]),
          matrix([
            [0, 0],
            [1, 22]
          ])
        ),
        matrix([
          [false, true],
          [true, false]
        ])
      )
    })

<<<<<<< HEAD
    it('should xor sparse matrix - sparse matrix', function () {
=======
    it('should xor sparse matrix - sparse matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        xor(
          sparse([
            [0, 1],
            [0, 12]
          ]),
          sparse([
            [0, 0],
            [1, 22]
          ])
        ),
        sparse([
          [false, true],
          [true, false]
        ])
      )
    })
  })

<<<<<<< HEAD
  it('should throw an error in case of invalid number of arguments', function () {
    assert.throws(function () {
      xor(1)
    }, /TypeError: Too few arguments/)
    assert.throws(function () {
=======
  it('should throw an error in case of invalid number of arguments', function (): void {
    assert.throws(function (): void {
      xor(1)
    }, /TypeError: Too few arguments/)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      xor(1, 2, 3)
    }, /TypeError: Too many arguments/)
  })

<<<<<<< HEAD
  it('should throw an error in case of invalid type of arguments', function () {
    assert.throws(function () {
      xor(2, null)
    }, /TypeError: Unexpected type of argument/)
    assert.throws(function () {
      xor(new Date(), true)
    }, /TypeError: Unexpected type of argument/)
    assert.throws(function () {
      xor(true, new Date())
    }, /TypeError: Unexpected type of argument/)
    assert.throws(function () {
      xor(true, undefined)
    }, /TypeError: Unexpected type of argument/)
    assert.throws(function () {
=======
  it('should throw an error in case of invalid type of arguments', function (): void {
    assert.throws(function (): void {
      xor(2, null)
    }, /TypeError: Unexpected type of argument/)
    assert.throws(function (): void {
      xor(new Date(), true)
    }, /TypeError: Unexpected type of argument/)
    assert.throws(function (): void {
      xor(true, new Date())
    }, /TypeError: Unexpected type of argument/)
    assert.throws(function (): void {
      xor(true, undefined)
    }, /TypeError: Unexpected type of argument/)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      xor(undefined, true)
    }, /TypeError: Unexpected type of argument/)
  })

<<<<<<< HEAD
  it('should LaTeX xor', function () {
=======
  it('should LaTeX xor', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const expression = math.parse('xor(1,2)')
    assert.strictEqual(expression.toTex(), '\\left(1\\veebar2\\right)')
  })
})
