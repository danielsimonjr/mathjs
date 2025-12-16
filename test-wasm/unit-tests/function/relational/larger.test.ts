<<<<<<< HEAD
// @ts-nocheck
=======
/**
 * Test for larger - AssemblyScript-friendly TypeScript
 */
>>>>>>> claude/review-sprints-quality-checks-Rlfec
// test larger
import assert from 'assert'

import math from '../../../../src/defaultInstance.ts'
const bignumber = math.bignumber
const complex = math.complex
const fraction = math.fraction
const matrix = math.matrix
const sparse = math.sparse
const unit = math.unit
const larger = math.larger

<<<<<<< HEAD
describe('larger', function () {
  it('should compare two numbers correctly', function () {
=======
interface MathNode {
  type: string
  toTex(): string
}

describe('larger', function (): void {
  it('should compare two numbers correctly', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(larger(2, 3), false)
    assert.strictEqual(larger(2, 2), false)
    assert.strictEqual(larger(2, 1), true)
    assert.strictEqual(larger(0, 0), false)
    assert.strictEqual(larger(-2, 2), false)
    assert.strictEqual(larger(-2, -3), true)
    assert.strictEqual(larger(-3, -2), false)
  })

<<<<<<< HEAD
  it('should compare two bigints correctly', function () {
=======
  it('should compare two bigints correctly', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(larger(2n, 3n), false)
    assert.strictEqual(larger(2n, 2n), false)
    assert.strictEqual(larger(2n, 1n), true)
    assert.strictEqual(larger(0n, 0n), false)
    assert.strictEqual(larger(-2n, 2n), false)
    assert.strictEqual(larger(-2n, -3n), true)
    assert.strictEqual(larger(-3n, -2n), false)
  })

<<<<<<< HEAD
  it('should compare two floating point numbers correctly', function () {
=======
  it('should compare two floating point numbers correctly', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    // Infinity
    assert.strictEqual(
      larger(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY),
      false
    )
    assert.strictEqual(
      larger(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY),
      false
    )
    assert.strictEqual(
      larger(Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY),
      true
    )
    assert.strictEqual(
      larger(Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY),
      false
    )
    assert.strictEqual(larger(Number.POSITIVE_INFINITY, 2.0), true)
    assert.strictEqual(larger(2.0, Number.POSITIVE_INFINITY), false)
    assert.strictEqual(larger(Number.NEGATIVE_INFINITY, 2.0), false)
    assert.strictEqual(larger(2.0, Number.NEGATIVE_INFINITY), true)
    // floating point numbers
    assert.strictEqual(larger(0.3 - 0.2, 0.1), false)
  })

<<<<<<< HEAD
  it('should compare two booleans', function () {
=======
  it('should compare two booleans', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(larger(true, true), false)
    assert.strictEqual(larger(true, false), true)
    assert.strictEqual(larger(false, true), false)
    assert.strictEqual(larger(false, false), false)
  })

<<<<<<< HEAD
  it('should compare mixed numbers and booleans', function () {
=======
  it('should compare mixed numbers and booleans', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(larger(2, true), true)
    assert.strictEqual(larger(0, true), false)
    assert.strictEqual(larger(true, 2), false)
    assert.strictEqual(larger(false, 2), false)
  })

<<<<<<< HEAD
  it('should compare bignumbers', function () {
=======
  it('should compare bignumbers', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(larger(bignumber(2), bignumber(3)), false)
    assert.strictEqual(larger(bignumber(2), bignumber(2)), false)
    assert.strictEqual(larger(bignumber(3), bignumber(2)), true)
    assert.strictEqual(larger(bignumber(0), bignumber(0)), false)
    assert.strictEqual(larger(bignumber(-2), bignumber(2)), false)
  })

<<<<<<< HEAD
  it('should compare mixed numbers and bignumbers', function () {
    assert.strictEqual(larger(bignumber(2), 3), false)
    assert.strictEqual(larger(2, bignumber(2)), false)

    assert.throws(function () {
      larger(1 / 3, bignumber(1).div(3))
    }, /Cannot implicitly convert a number with >15 significant digits to BigNumber/)
    assert.throws(function () {
=======
  it('should compare mixed numbers and bignumbers', function (): void {
    assert.strictEqual(larger(bignumber(2), 3), false)
    assert.strictEqual(larger(2, bignumber(2)), false)

    assert.throws(function (): void {
      larger(1 / 3, bignumber(1).div(3))
    }, /Cannot implicitly convert a number with >15 significant digits to BigNumber/)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      larger(bignumber(1).div(3), 1 / 3)
    }, /Cannot implicitly convert a number with >15 significant digits to BigNumber/)
  })

<<<<<<< HEAD
  it('should compare mixed numbers and bigints', function () {
    assert.strictEqual(larger(2n, 3), false)
    assert.strictEqual(larger(2, 2n), false)

    assert.throws(function () {
      larger(1 / 3, bignumber(1).div(3))
    }, /Cannot implicitly convert a number with >15 significant digits to BigNumber/)
    assert.throws(function () {
      larger(bignumber(1).div(3), 1 / 3)
    }, /Cannot implicitly convert a number with >15 significant digits to BigNumber/)

    assert.throws(function () {
      larger(123123123123123123123n, 1)
    }, /Cannot implicitly convert bigint to number: value exceeds the max safe integer value/)
    assert.throws(function () {
=======
  it('should compare mixed numbers and bigints', function (): void {
    assert.strictEqual(larger(2n, 3), false)
    assert.strictEqual(larger(2, 2n), false)

    assert.throws(function (): void {
      larger(1 / 3, bignumber(1).div(3))
    }, /Cannot implicitly convert a number with >15 significant digits to BigNumber/)
    assert.throws(function (): void {
      larger(bignumber(1).div(3), 1 / 3)
    }, /Cannot implicitly convert a number with >15 significant digits to BigNumber/)

    assert.throws(function (): void {
      larger(123123123123123123123n, 1)
    }, /Cannot implicitly convert bigint to number: value exceeds the max safe integer value/)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      larger(1, 123123123123123123123n)
    }, /Cannot implicitly convert bigint to number: value exceeds the max safe integer value/)
  })

<<<<<<< HEAD
  it('should compare mixed booleans and bignumbers', function () {
=======
  it('should compare mixed booleans and bignumbers', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(larger(bignumber(0.1), true), false)
    assert.strictEqual(larger(bignumber(1), true), false)
    assert.strictEqual(larger(bignumber(1), false), true)
    assert.strictEqual(larger(false, bignumber(0)), false)
    assert.strictEqual(larger(true, bignumber(0)), true)
  })

<<<<<<< HEAD
  it('should compare two fractions', function () {
=======
  it('should compare two fractions', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(larger(fraction(3), fraction(2)).valueOf(), true)
    assert.strictEqual(larger(fraction(2), fraction(3)).valueOf(), false)
    assert.strictEqual(larger(fraction(3), fraction(3)).valueOf(), false)
  })

<<<<<<< HEAD
  it('should compare mixed fractions and numbers', function () {
=======
  it('should compare mixed fractions and numbers', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(larger(1, fraction(1, 3)), true)
    assert.strictEqual(larger(fraction(2), 2), false)
  })

<<<<<<< HEAD
  it('should compare mixed fractions and bigints', function () {
=======
  it('should compare mixed fractions and bigints', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(larger(1n, fraction(1, 3)), true)
    assert.strictEqual(larger(fraction(2), 2n), false)
  })

<<<<<<< HEAD
  it('should compare mixed fractions and bignumbers', function () {
=======
  it('should compare mixed fractions and bignumbers', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(larger(bignumber(1), fraction(1, 3)), true)
    assert.strictEqual(larger(fraction(2), bignumber(2)), false)
  })

<<<<<<< HEAD
  it('should add two measures of the same unit', function () {
=======
  it('should add two measures of the same unit', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(larger(unit('100cm'), unit('10inch')), true)
    assert.strictEqual(larger(unit('99cm'), unit('1m')), false)
    // assert.strictEqual(larger(unit('100cm'), unit('1m')), false); // dangerous, round-off errors
    assert.strictEqual(larger(unit('101cm'), unit('1m')), true)
  })

<<<<<<< HEAD
  it('should apply configuration option relTol', function () {
=======
  it('should apply configuration option relTol', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const mymath = math.create()
    assert.strictEqual(mymath.larger(1, 0.991), true)
    assert.strictEqual(
      mymath.larger(mymath.bignumber(1), mymath.bignumber(0.991)),
      true
    )

    mymath.config({ relTol: 1e-2 })
    assert.strictEqual(mymath.larger(1, 0.991), false)
    assert.strictEqual(
      mymath.larger(mymath.bignumber(1), mymath.bignumber(0.991)),
      false
    )
  })

<<<<<<< HEAD
  it('should throw an error if comparing a unit with a number', function () {
    assert.throws(function () {
=======
  it('should throw an error if comparing a unit with a number', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      larger(unit('100cm'), 22)
    })
  })

<<<<<<< HEAD
  it('should throw an error for two measures of different units', function () {
    assert.throws(function () {
=======
  it('should throw an error for two measures of different units', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      larger(math.unit(5, 'km'), math.unit(100, 'gram'))
    })
  })

<<<<<<< HEAD
  it('should throw an error if comparing a unit with a bignumber', function () {
    assert.throws(function () {
=======
  it('should throw an error if comparing a unit with a bignumber', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      larger(unit('100cm'), bignumber(22))
    })
  })

<<<<<<< HEAD
  it('should compare two strings by their numerical value', function () {
    assert.strictEqual(larger('0', 0), false)
    assert.strictEqual(larger('10', '2'), true)

    assert.throws(function () {
=======
  it('should compare two strings by their numerical value', function (): void {
    assert.strictEqual(larger('0', 0), false)
    assert.strictEqual(larger('10', '2'), true)

    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      larger('A', 'B')
    }, /Cannot convert "A" to a number/)
  })

<<<<<<< HEAD
  it('should result in false when comparing a something with NaN', function () {
=======
  it('should result in false when comparing a something with NaN', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    // Number
    assert.strictEqual(larger(NaN, 3), false)
    assert.strictEqual(larger(3, NaN), false)
    assert.strictEqual(larger(NaN, NaN), false)

    // BigNumber
    assert.strictEqual(larger(NaN, bignumber(3)), false)
    assert.strictEqual(larger(bignumber(3), NaN), false)
    assert.strictEqual(larger(3, bignumber(NaN)), false)
    assert.strictEqual(larger(bignumber(NaN), 3), false)
    assert.strictEqual(larger(bignumber(NaN), bignumber(3)), false)
    assert.strictEqual(larger(bignumber(3), bignumber(NaN)), false)

    // Fraction
    assert.strictEqual(larger(NaN, fraction(3)), false)
    assert.strictEqual(larger(fraction(3), NaN), false)
    assert.strictEqual(larger(fraction(3), bignumber(NaN)), false)
    assert.strictEqual(larger(bignumber(NaN), fraction(3)), false)
    // A fraction itself will throw an error when it's NaN

    // Unit
    assert.strictEqual(larger(unit('3', 's'), unit(NaN, 's')), false)
    assert.strictEqual(larger(unit(NaN, 's'), unit('3', 's')), false)
    assert.strictEqual(larger(unit(NaN, 's'), unit(NaN, 's')), false)
  })

<<<<<<< HEAD
  describe('Array', function () {
    it('should compare array - scalar', function () {
=======
  describe('Array', function (): void {
    it('should compare array - scalar', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(larger(2, [1, 2, 3]), [true, false, false])
      assert.deepStrictEqual(larger([1, 2, 3], 2), [false, false, true])
    })

<<<<<<< HEAD
    it('should compare array - array', function () {
=======
    it('should compare array - array', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        larger(
          [
            [1, 2, 0],
            [-1, 0, 2]
          ],
          [
            [1, -1, 0],
            [-1, 1, 0]
          ]
        ),
        [
          [false, true, false],
          [false, false, true]
        ]
      )
    })

<<<<<<< HEAD
    it('should compare broadcastable arrays', function () {
=======
    it('should compare broadcastable arrays', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(larger([[1, 2, 0]], [[1], [-1]]), [
        [false, true, false],
        [true, true, true]
      ])
    })

<<<<<<< HEAD
    it('should compare array - dense matrix', function () {
=======
    it('should compare array - dense matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        larger(
          [
            [1, 2, 0],
            [-1, 0, 2]
          ],
          matrix([
            [1, -1, 0],
            [-1, 1, 0]
          ])
        ),
        matrix([
          [false, true, false],
          [false, false, true]
        ])
      )
    })

<<<<<<< HEAD
    it('should compare array - sparse matrix', function () {
=======
    it('should compare array - sparse matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        larger(
          [
            [1, 2, 0],
            [-1, 0, 2]
          ],
          sparse([
            [1, -1, 0],
            [-1, 1, 0]
          ])
        ),
        matrix([
          [false, true, false],
          [false, false, true]
        ])
      )
    })

<<<<<<< HEAD
    it('should throw an error if arrays have different sizes', function () {
      assert.throws(function () {
=======
    it('should throw an error if arrays have different sizes', function (): void {
      assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
        larger([1, 4, 5], [3, 4])
      })
    })
  })

<<<<<<< HEAD
  describe('DenseMatrix', function () {
    it('should compare dense matrix - scalar', function () {
=======
  describe('DenseMatrix', function (): void {
    it('should compare dense matrix - scalar', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        larger(2, matrix([1, 2, 3])),
        matrix([true, false, false])
      )
      assert.deepStrictEqual(
        larger(matrix([1, 2, 3]), 2),
        matrix([false, false, true])
      )
    })

<<<<<<< HEAD
    it('should compare dense matrix - array', function () {
=======
    it('should compare dense matrix - array', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        larger(
          matrix([
            [1, 2, 0],
            [-1, 0, 2]
          ]),
          [
            [1, -1, 0],
            [-1, 1, 0]
          ]
        ),
        matrix([
          [false, true, false],
          [false, false, true]
        ])
      )
    })

<<<<<<< HEAD
    it('should compare dense matrix - dense matrix', function () {
=======
    it('should compare dense matrix - dense matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        larger(
          matrix([
            [1, 2, 0],
            [-1, 0, 2]
          ]),
          matrix([
            [1, -1, 0],
            [-1, 1, 0]
          ])
        ),
        matrix([
          [false, true, false],
          [false, false, true]
        ])
      )
    })

<<<<<<< HEAD
    it('should compare dense matrix - sparse matrix', function () {
=======
    it('should compare dense matrix - sparse matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        larger(
          matrix([
            [1, 2, 0],
            [-1, 0, 2]
          ]),
          sparse([
            [1, -1, 0],
            [-1, 1, 0]
          ])
        ),
        matrix([
          [false, true, false],
          [false, false, true]
        ])
      )
    })
  })

<<<<<<< HEAD
  describe('SparseMatrix', function () {
    it('should compare sparse matrix - scalar', function () {
=======
  describe('SparseMatrix', function (): void {
    it('should compare sparse matrix - scalar', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        larger(
          2,
          sparse([
            [1, 2],
            [3, 4]
          ])
        ),
        matrix([
          [true, false],
          [false, false]
        ])
      )
      assert.deepStrictEqual(
        larger(
          sparse([
            [1, 2],
            [3, 4]
          ]),
          2
        ),
        matrix([
          [false, false],
          [true, true]
        ])
      )
    })

<<<<<<< HEAD
    it('should compare sparse matrix - array', function () {
=======
    it('should compare sparse matrix - array', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        larger(
          sparse([
            [1, 2, 0],
            [-1, 0, 2]
          ]),
          [
            [1, -1, 0],
            [-1, 1, 0]
          ]
        ),
        matrix([
          [false, true, false],
          [false, false, true]
        ])
      )
    })

<<<<<<< HEAD
    it('should compare sparse matrix - dense matrix', function () {
=======
    it('should compare sparse matrix - dense matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        larger(
          sparse([
            [1, 2, 0],
            [-1, 0, 2]
          ]),
          matrix([
            [1, -1, 0],
            [-1, 1, 0]
          ])
        ),
        matrix([
          [false, true, false],
          [false, false, true]
        ])
      )
    })

<<<<<<< HEAD
    it('should compare sparse matrix - sparse matrix', function () {
=======
    it('should compare sparse matrix - sparse matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        larger(
          sparse([
            [1, 2, 0],
            [-1, 0, 2]
          ]),
          sparse([
            [1, -1, 0],
            [-1, 1, 0]
          ])
        ),
        sparse([
          [false, true, false],
          [false, false, true]
        ])
      )
    })
  })

<<<<<<< HEAD
  it('should throw an error when comparing complex numbers', function () {
    assert.throws(function () {
      larger(complex(1, 1), complex(1, 2))
    }, TypeError)
    assert.throws(function () {
      larger(complex(2, 1), 3)
    }, TypeError)
    assert.throws(function () {
      larger(3, complex(2, 4))
    }, TypeError)
    assert.throws(function () {
      larger(math.bignumber(3), complex(2, 4))
    }, TypeError)
    assert.throws(function () {
=======
  it('should throw an error when comparing complex numbers', function (): void {
    assert.throws(function (): void {
      larger(complex(1, 1), complex(1, 2))
    }, TypeError)
    assert.throws(function (): void {
      larger(complex(2, 1), 3)
    }, TypeError)
    assert.throws(function (): void {
      larger(3, complex(2, 4))
    }, TypeError)
    assert.throws(function (): void {
      larger(math.bignumber(3), complex(2, 4))
    }, TypeError)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      larger(complex(2, 4), math.bignumber(3))
    }, TypeError)
  })

<<<<<<< HEAD
  it('should throw an error if matrices are different sizes', function () {
    assert.throws(function () {
=======
  it('should throw an error if matrices are different sizes', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      larger([1, 4, 6], [3, 4])
    })
  })

<<<<<<< HEAD
  it('should throw an error in case of invalid number of arguments', function () {
    assert.throws(function () {
      larger(1)
    }, /Too few arguments/)
    assert.throws(function () {
=======
  it('should throw an error in case of invalid number of arguments', function (): void {
    assert.throws(function (): void {
      larger(1)
    }, /Too few arguments/)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      larger(1, 2, 3)
    }, /Too many arguments/)
  })

<<<<<<< HEAD
  it('should throw an error in case of invalid type of arguments', function () {
    assert.throws(function () {
=======
  it('should throw an error in case of invalid type of arguments', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      larger(2, null)
    }, /TypeError: Unexpected type of argument/)
  })

<<<<<<< HEAD
  it('should LaTeX larger', function () {
=======
  it('should LaTeX larger', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const expression = math.parse('larger(1,2)')
    assert.strictEqual(expression.toTex(), '\\left(1>2\\right)')
  })
})
