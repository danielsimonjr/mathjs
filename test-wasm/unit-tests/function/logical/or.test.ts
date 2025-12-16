<<<<<<< HEAD
// @ts-nocheck
// test or
import assert from 'assert'

import math from '../../../../src/defaultInstance.ts'
=======
/**
 * Test for or - AssemblyScript-friendly TypeScript
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
const or = math.or

<<<<<<< HEAD
describe('or', function () {
  it('should or two numbers correctly', function () {
=======
describe('or', function (): void {
  it('should or two numbers correctly', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(or(1, 1), true)
    assert.strictEqual(or(-1, 1), true)
    assert.strictEqual(or(-1, -1), true)
    assert.strictEqual(or(0, -1), true)
    assert.strictEqual(or(1, 0), true)
    assert.strictEqual(or(1, NaN), true)
    assert.strictEqual(or(NaN, 1), true)
    assert.strictEqual(or(1e10, 0.019209), true)
    assert.strictEqual(or(-1.0e-100, 1.0e-100), true)
    assert.strictEqual(or(Infinity, -Infinity), true)
    assert.strictEqual(or(NaN, NaN), false)
    assert.strictEqual(or(NaN, 0), false)
    assert.strictEqual(or(0, NaN), false)
    assert.strictEqual(or(0, 0), false)
  })

<<<<<<< HEAD
  it('should or two complex numbers', function () {
=======
  it('should or two complex numbers', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(or(complex(1, 1), complex(1, 1)), true)
    assert.strictEqual(or(complex(0, 1), complex(1, 1)), true)
    assert.strictEqual(or(complex(1, 0), complex(1, 1)), true)
    assert.strictEqual(or(complex(1, 1), complex(0, 1)), true)
    assert.strictEqual(or(complex(1, 1), complex(1, 0)), true)
    assert.strictEqual(or(complex(1, 0), complex(1, 0)), true)
    assert.strictEqual(or(complex(0, 1), complex(0, 1)), true)
    assert.strictEqual(or(complex(0, 0), complex(1, 1)), true)
    assert.strictEqual(or(complex(0, 0), complex(0, 1)), true)
    assert.strictEqual(or(complex(0, 0), complex(1, 0)), true)
    assert.strictEqual(or(complex(1, 1), complex(0, 0)), true)
    assert.strictEqual(or(complex(0, 1), complex(0, 0)), true)
    assert.strictEqual(or(complex(1, 0), complex(0, 0)), true)
    assert.strictEqual(or(complex(), complex(1, 1)), true)
    assert.strictEqual(or(complex(0), complex(1, 1)), true)
    assert.strictEqual(or(complex(1), complex(1, 1)), true)
    assert.strictEqual(or(complex(1, 1), complex()), true)
    assert.strictEqual(or(complex(1, 1), complex(0)), true)
    assert.strictEqual(or(complex(1, 1), complex(1)), true)
    assert.strictEqual(or(complex(0, 0), complex(0, 0)), false)
    assert.strictEqual(or(complex(), complex()), false)
  })

<<<<<<< HEAD
  it('should or mixed numbers and complex numbers', function () {
=======
  it('should or mixed numbers and complex numbers', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(or(complex(1, 1), 1), true)
    assert.strictEqual(or(complex(1, 1), 0), true)
    assert.strictEqual(or(1, complex(1, 1)), true)
    assert.strictEqual(or(0, complex(1, 1)), true)
    assert.strictEqual(or(complex(0, 0), 1), true)
    assert.strictEqual(or(1, complex(0, 0)), true)
    assert.strictEqual(or(0, complex(0, 0)), false)
    assert.strictEqual(or(complex(0, 0), 0), false)
  })

<<<<<<< HEAD
  it('should or two booleans', function () {
=======
  it('should or two booleans', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(or(true, true), true)
    assert.strictEqual(or(true, false), true)
    assert.strictEqual(or(false, true), true)
    assert.strictEqual(or(false, false), false)
  })

<<<<<<< HEAD
  it('should or mixed numbers and booleans', function () {
=======
  it('should or mixed numbers and booleans', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(or(2, true), true)
    assert.strictEqual(or(2, false), true)
    assert.strictEqual(or(0, true), true)
    assert.strictEqual(or(0, false), false)
    assert.strictEqual(or(true, 2), true)
    assert.strictEqual(or(false, 2), true)
    assert.strictEqual(or(false, 0), false)
  })

<<<<<<< HEAD
  it('should or bignumbers', function () {
=======
  it('should or bignumbers', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(or(bignumber(1), bignumber(1)), true)
    assert.strictEqual(or(bignumber(-1), bignumber(1)), true)
    assert.strictEqual(or(bignumber(-1), bignumber(-1)), true)
    assert.strictEqual(or(bignumber(0), bignumber(-1)), true)
    assert.strictEqual(or(bignumber(1), bignumber(0)), true)
    assert.strictEqual(or(bignumber(1), bignumber(NaN)), true)
    assert.strictEqual(or(bignumber(NaN), bignumber(1)), true)
    assert.strictEqual(or(bignumber('1e+10'), bignumber(0.19209)), true)
    assert.strictEqual(or(bignumber('-1.0e-100'), bignumber('1.0e-100')), true)
    assert.strictEqual(or(bignumber(Infinity), bignumber(-Infinity)), true)
    assert.strictEqual(or(bignumber(NaN), bignumber(NaN)), false)
    assert.strictEqual(or(bignumber(NaN), bignumber(0)), false)
    assert.strictEqual(or(bignumber(0), bignumber(NaN)), false)
    assert.strictEqual(or(bignumber(0), bignumber(0)), false)
  })

<<<<<<< HEAD
  it('should or bigints', function () {
=======
  it('should or bigints', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(or(1n, 1n), true)
    assert.strictEqual(or(-1n, 1n), true)
    assert.strictEqual(or(-1n, -1n), true)
    assert.strictEqual(or(0n, -1n), true)
    assert.strictEqual(or(1n, 0n), true)
  })

<<<<<<< HEAD
  it('should or mixed numbers and bignumbers', function () {
=======
  it('should or mixed numbers and bignumbers', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(or(bignumber(2), 3), true)
    assert.strictEqual(or(2, bignumber(2)), true)
    assert.strictEqual(or(0, bignumber(2)), true)
    assert.strictEqual(or(2, bignumber(0)), true)
    assert.strictEqual(or(bignumber(0), 2), true)
    assert.strictEqual(or(bignumber(0), 0), false)
    assert.strictEqual(or(bignumber(2), 0), true)
    assert.strictEqual(or(bignumber(0), 0), false)
  })

<<<<<<< HEAD
  it('should or mixed numbers and bigints', function () {
=======
  it('should or mixed numbers and bigints', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(or(2n, 3), true)
    assert.strictEqual(or(2, 3n), true)
  })

<<<<<<< HEAD
  it('should or two units', function () {
=======
  it('should or two units', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(or(unit('100cm'), unit('10inch')), true)
    assert.strictEqual(or(unit('100cm'), unit('0 inch')), true)
    assert.strictEqual(or(unit('0cm'), unit('1m')), true)
    assert.strictEqual(or(unit('m'), unit('1m')), true)
    assert.strictEqual(or(unit('1dm'), unit('m')), true)
    assert.strictEqual(or(unit('dm'), unit('m')), false)
    assert.strictEqual(or(unit('-100cm'), unit('-10inch')), true)
    assert.strictEqual(or(unit(5, 'km'), unit(100, 'gram')), true)
    assert.strictEqual(or(unit(5, 'km'), unit(0, 'gram')), true)
    assert.strictEqual(or(unit(0, 'km'), unit(100, 'gram')), true)
    assert.strictEqual(or(unit(0, 'km'), unit(0, 'gram')), false)

    assert.strictEqual(
      or(unit(bignumber(0), 'm'), unit(bignumber(0), 'm')),
      false
    )
    assert.strictEqual(
      or(unit(bignumber(1), 'm'), unit(bignumber(0), 'm')),
      true
    )
    assert.strictEqual(
      or(unit(bignumber(0), 'm'), unit(bignumber(1), 'm')),
      true
    )
    assert.strictEqual(
      or(unit(bignumber(1), 'm'), unit(bignumber(1), 'm')),
      true
    )
  })

<<<<<<< HEAD
  it('should or two arrays', function () {
=======
  it('should or two arrays', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(or([0, 1, 0, 12], [0, 0, 1, 22]), [
      false,
      true,
      true,
      true
    ])
    assert.deepStrictEqual(or([], []), [])
  })

<<<<<<< HEAD
  it('should or mixed numbers and arrays', function () {
=======
  it('should or mixed numbers and arrays', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(or(10, [0, 2]), [true, true])
    assert.deepStrictEqual(or([0, 2], 10), [true, true])
    assert.deepStrictEqual(or(0, [0, 2]), [false, true])
    assert.deepStrictEqual(or([0, 2], 0), [false, true])
  })

<<<<<<< HEAD
  describe('Array', function () {
    it('should or array - scalar', function () {
=======
  describe('Array', function (): void {
    it('should or array - scalar', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(or(10, [0, 2]), [true, true])
      assert.deepStrictEqual(or([0, 2], 10), [true, true])
    })

<<<<<<< HEAD
    it('should or array - array', function () {
=======
    it('should or array - array', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(or([0, 1, 0, 12], [0, 0, 1, 22]), [
        false,
        true,
        true,
        true
      ])
      assert.deepStrictEqual(or([], []), [])
    })

<<<<<<< HEAD
    it('should or broadcastable arrays', function () {
=======
    it('should or broadcastable arrays', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(or([[0, 1, 0, 12]], [[0], [0], [1], [22]]), [
        [false, true, false, true],
        [false, true, false, true],
        [true, true, true, true],
        [true, true, true, true]
      ])
    })

<<<<<<< HEAD
    it('should or array - dense matrix', function () {
=======
    it('should or array - dense matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        or([0, 1, 0, 12], matrix([0, 0, 1, 22])),
        matrix([false, true, true, true])
      )
      assert.deepStrictEqual(or([], matrix([])), matrix([]))
    })

<<<<<<< HEAD
    it('should or array - sparse matrix', function () {
=======
    it('should or array - sparse matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        or(
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
          [true, true]
        ])
      )
    })
  })

<<<<<<< HEAD
  describe('DenseMatrix', function () {
    it('should or dense matrix - scalar', function () {
=======
  describe('DenseMatrix', function (): void {
    it('should or dense matrix - scalar', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(or(10, matrix([0, 2])), matrix([true, true]))
      assert.deepStrictEqual(or(matrix([0, 2]), 10), matrix([true, true]))
    })

<<<<<<< HEAD
    it('should or dense matrix - array', function () {
=======
    it('should or dense matrix - array', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        or(matrix([0, 1, 0, 12]), [0, 0, 1, 22]),
        matrix([false, true, true, true])
      )
      assert.deepStrictEqual(or(matrix([]), []), matrix([]))
    })

<<<<<<< HEAD
    it('should or dense matrix - dense matrix', function () {
=======
    it('should or dense matrix - dense matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        or(matrix([0, 1, 0, 12]), matrix([0, 0, 1, 22])),
        matrix([false, true, true, true])
      )
      assert.deepStrictEqual(or(matrix([]), matrix([])), matrix([]))
    })

<<<<<<< HEAD
    it('should or dense matrix - sparse matrix', function () {
=======
    it('should or dense matrix - sparse matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        or(
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
          [true, true]
        ])
      )
    })
  })

<<<<<<< HEAD
  describe('SparseMatrix', function () {
    it('should or sparse matrix - scalar', function () {
=======
  describe('SparseMatrix', function (): void {
    it('should or sparse matrix - scalar', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        or(10, sparse([[0], [2]])),
        matrix([[true], [true]])
      )
      assert.deepStrictEqual(
        or(sparse([[0], [2]]), 10),
        matrix([[true], [true]])
      )
    })

<<<<<<< HEAD
    it('should or sparse matrix - array', function () {
=======
    it('should or sparse matrix - array', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        or(
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
          [true, true]
        ])
      )
    })

<<<<<<< HEAD
    it('should or sparse matrix - dense matrix', function () {
=======
    it('should or sparse matrix - dense matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        or(
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
          [true, true]
        ])
      )
    })

<<<<<<< HEAD
    it('should or sparse matrix - sparse matrix', function () {
=======
    it('should or sparse matrix - sparse matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        or(
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
          [true, true]
        ])
      )
    })
  })

<<<<<<< HEAD
  it('should throw an error in case of invalid number of arguments', function () {
    assert.throws(function () {
      or(1)
    }, /TypeError: Too few arguments/)
    assert.throws(function () {
=======
  it('should throw an error in case of invalid number of arguments', function (): void {
    assert.throws(function (): void {
      or(1)
    }, /TypeError: Too few arguments/)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      or(1, 2, 3)
    }, /TypeError: Too many arguments/)
  })

<<<<<<< HEAD
  it('should throw an error in case of invalid type of arguments', function () {
    assert.throws(function () {
      or(2, null)
    }, /TypeError: Unexpected type of argument/)
    assert.throws(function () {
      or(new Date(), true)
    }, /TypeError: Unexpected type of argument/)
    assert.throws(function () {
      or(true, new Date())
    }, /TypeError: Unexpected type of argument/)
    assert.throws(function () {
      or(true, undefined)
    }, /TypeError: Unexpected type of argument/)
    assert.throws(function () {
=======
  it('should throw an error in case of invalid type of arguments', function (): void {
    assert.throws(function (): void {
      or(2, null)
    }, /TypeError: Unexpected type of argument/)
    assert.throws(function (): void {
      or(new Date(), true)
    }, /TypeError: Unexpected type of argument/)
    assert.throws(function (): void {
      or(true, new Date())
    }, /TypeError: Unexpected type of argument/)
    assert.throws(function (): void {
      or(true, undefined)
    }, /TypeError: Unexpected type of argument/)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      or(undefined, true)
    }, /TypeError: Unexpected type of argument/)
  })

<<<<<<< HEAD
  it('should LaTeX or', function () {
=======
  it('should LaTeX or', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const expression = math.parse('or(1,2)')
    assert.strictEqual(expression.toTex(), '\\left(1\\vee2\\right)')
  })
})
