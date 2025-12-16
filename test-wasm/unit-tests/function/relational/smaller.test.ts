<<<<<<< HEAD
// @ts-nocheck
=======
/**
 * Test for smaller - AssemblyScript-friendly TypeScript
 */
>>>>>>> claude/review-sprints-quality-checks-Rlfec
// test smaller
import assert from 'assert'

import math from '../../../../src/defaultInstance.ts'
const bignumber = math.bignumber
const complex = math.complex
const fraction = math.fraction
const matrix = math.matrix
const sparse = math.sparse
const unit = math.unit
const smaller = math.smaller

<<<<<<< HEAD
describe('smaller', function () {
  it('should compare two numbers correctly', function () {
=======
interface MathNode {
  type: string
  toTex(): string
}

describe('smaller', function (): void {
  it('should compare two numbers correctly', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(smaller(2, 3), true)
    assert.strictEqual(smaller(2, 2), false)
    assert.strictEqual(smaller(2, 1), false)
    assert.strictEqual(smaller(0, 0), false)
    assert.strictEqual(smaller(-2, 2), true)
    assert.strictEqual(smaller(-2, -3), false)
    assert.strictEqual(smaller(-3, -2), true)
  })

<<<<<<< HEAD
  it('should compare two bigints correctly', function () {
=======
  it('should compare two bigints correctly', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(smaller(2n, 3n), true)
    assert.strictEqual(smaller(2n, 2n), false)
    assert.strictEqual(smaller(2n, 1n), false)
    assert.strictEqual(smaller(0n, 0n), false)
    assert.strictEqual(smaller(-2n, 2n), true)
    assert.strictEqual(smaller(-2n, -3n), false)
    assert.strictEqual(smaller(-3n, -2n), true)
  })

<<<<<<< HEAD
  it('should compare two floating point numbers correctly', function () {
=======
  it('should compare two floating point numbers correctly', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    // Infinity
    assert.strictEqual(
      smaller(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY),
      false
    )
    assert.strictEqual(
      smaller(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY),
      false
    )
    assert.strictEqual(
      smaller(Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY),
      false
    )
    assert.strictEqual(
      smaller(Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY),
      true
    )
    assert.strictEqual(smaller(Number.POSITIVE_INFINITY, 2.0), false)
    assert.strictEqual(smaller(2.0, Number.POSITIVE_INFINITY), true)
    assert.strictEqual(smaller(Number.NEGATIVE_INFINITY, 2.0), true)
    assert.strictEqual(smaller(2.0, Number.NEGATIVE_INFINITY), false)
    // floating point numbers
    assert.strictEqual(smaller(0.3 - 0.2, 0.1), false)
  })

<<<<<<< HEAD
  it('should compare two booleans', function () {
=======
  it('should compare two booleans', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(smaller(true, true), false)
    assert.strictEqual(smaller(true, false), false)
    assert.strictEqual(smaller(false, true), true)
    assert.strictEqual(smaller(false, false), false)
  })

<<<<<<< HEAD
  it('should compare mixed numbers and booleans', function () {
=======
  it('should compare mixed numbers and booleans', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(smaller(2, true), false)
    assert.strictEqual(smaller(1, true), false)
    assert.strictEqual(smaller(0, true), true)
    assert.strictEqual(smaller(true, 2), true)
    assert.strictEqual(smaller(true, 1), false)
    assert.strictEqual(smaller(false, 2), true)
  })

<<<<<<< HEAD
  it('should compare bignumbers', function () {
=======
  it('should compare bignumbers', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(smaller(bignumber(2), bignumber(3)), true)
    assert.deepStrictEqual(smaller(bignumber(2), bignumber(2)), false)
    assert.deepStrictEqual(smaller(bignumber(3), bignumber(2)), false)
    assert.deepStrictEqual(smaller(bignumber(0), bignumber(0)), false)
    assert.deepStrictEqual(smaller(bignumber(-2), bignumber(2)), true)
  })

<<<<<<< HEAD
  it('should compare mixed numbers and bignumbers', function () {
=======
  it('should compare mixed numbers and bignumbers', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(smaller(bignumber(2), 3), true)
    assert.deepStrictEqual(smaller(2, bignumber(2)), false)

    // assert.strictEqual(smaller(1/3, bignumber(1).div(3)), false)
    // assert.strictEqual(smaller(bignumber(1).div(3), 1/3), false)

<<<<<<< HEAD
    assert.throws(function () {
      smaller(1 / 3, bignumber(1).div(3))
    }, /Cannot implicitly convert a number with >15 significant digits to BigNumber/)
    assert.throws(function () {
=======
    assert.throws(function (): void {
      smaller(1 / 3, bignumber(1).div(3))
    }, /Cannot implicitly convert a number with >15 significant digits to BigNumber/)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      smaller(bignumber(1).div(3), 1 / 3)
    }, /Cannot implicitly convert a number with >15 significant digits to BigNumber/)
  })

<<<<<<< HEAD
  it('should compare mixed numbers and bigints', function () {
    assert.deepStrictEqual(smaller(2n, 3), true)
    assert.deepStrictEqual(smaller(2, 2n), false)

    assert.throws(function () {
      smaller(123123123123123123123n, 1)
    }, /Cannot implicitly convert bigint to number: value exceeds the max safe integer value/)
    assert.throws(function () {
=======
  it('should compare mixed numbers and bigints', function (): void {
    assert.deepStrictEqual(smaller(2n, 3), true)
    assert.deepStrictEqual(smaller(2, 2n), false)

    assert.throws(function (): void {
      smaller(123123123123123123123n, 1)
    }, /Cannot implicitly convert bigint to number: value exceeds the max safe integer value/)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      smaller(1, 123123123123123123123n)
    }, /Cannot implicitly convert bigint to number: value exceeds the max safe integer value/)
  })

<<<<<<< HEAD
  it('should compare mixed booleans and bignumbers', function () {
=======
  it('should compare mixed booleans and bignumbers', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(smaller(bignumber(0.1), true), true)
    assert.deepStrictEqual(smaller(bignumber(1), true), false)
    assert.deepStrictEqual(smaller(bignumber(1), false), false)
    assert.deepStrictEqual(smaller(bignumber(0), false), false)
    assert.deepStrictEqual(smaller(false, bignumber(0)), false)
    assert.deepStrictEqual(smaller(true, bignumber(0)), false)
    assert.deepStrictEqual(smaller(true, bignumber(1)), false)
  })

<<<<<<< HEAD
  it('should compare two fractions', function () {
=======
  it('should compare two fractions', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(smaller(fraction(3), fraction(2)).valueOf(), false)
    assert.strictEqual(smaller(fraction(2), fraction(3)).valueOf(), true)
    assert.strictEqual(smaller(fraction(3), fraction(3)).valueOf(), false)
  })

<<<<<<< HEAD
  it('should compare mixed fractions and numbers', function () {
=======
  it('should compare mixed fractions and numbers', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(smaller(1, fraction(1, 3)), false)
    assert.strictEqual(smaller(fraction(2), 2), false)
  })

<<<<<<< HEAD
  it('should compare mixed fractions and bigints', function () {
=======
  it('should compare mixed fractions and bigints', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(smaller(1n, fraction(1, 3)), false)
    assert.strictEqual(smaller(fraction(2), 2n), false)
  })

<<<<<<< HEAD
  it('should compare mixed fractions and bignumbers', function () {
=======
  it('should compare mixed fractions and bignumbers', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(smaller(bignumber(1), fraction(1, 3)), false)
    assert.strictEqual(smaller(fraction(2), bignumber(2)), false)
  })

<<<<<<< HEAD
  it('should compare two measures of the same unit correctly', function () {
=======
  it('should compare two measures of the same unit correctly', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(smaller(unit('100cm'), unit('10inch')), false)
    assert.strictEqual(smaller(unit('99cm'), unit('1m')), true)
    // assert.strictEqual(smaller(unit('100cm'), unit('1m')), false); // dangerous, round-off errors
    assert.strictEqual(smaller(unit('101cm'), unit('1m')), false)
  })

<<<<<<< HEAD
  it('should apply configuration option relTol', function () {
=======
  it('should apply configuration option relTol', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const mymath = math.create()
    assert.strictEqual(mymath.smaller(0.991, 1), true)
    assert.strictEqual(
      mymath.smaller(mymath.bignumber(0.991), mymath.bignumber(1)),
      true
    )

    mymath.config({ relTol: 1e-2 })
    assert.strictEqual(mymath.smaller(0.991, 1), false)
    assert.strictEqual(
      mymath.smaller(mymath.bignumber(0.991), mymath.bignumber(1)),
      false
    )
  })

<<<<<<< HEAD
  it('should throw an error if comparing a unit and a number', function () {
    assert.throws(function () {
=======
  it('should throw an error if comparing a unit and a number', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      smaller(unit('100cm'), 22)
    })
  })

<<<<<<< HEAD
  it('should throw an error for two measures of different units', function () {
    assert.throws(function () {
=======
  it('should throw an error for two measures of different units', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      smaller(math.unit(5, 'km'), math.unit(100, 'gram'))
    })
  })

<<<<<<< HEAD
  it('should throw an error if comparing a unit and a bignumber', function () {
    assert.throws(function () {
=======
  it('should throw an error if comparing a unit and a bignumber', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      smaller(unit('100cm'), bignumber(22))
    })
  })

<<<<<<< HEAD
  it('should compare two strings by their numerical value', function () {
=======
  it('should compare two strings by their numerical value', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(smaller('0', 0), false)
    assert.strictEqual(smaller('10', '2'), false)
    assert.strictEqual(smaller('1e3', '1000'), false)

<<<<<<< HEAD
    assert.throws(function () {
=======
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      smaller('A', 'B')
    }, /Cannot convert "A" to a number/)
  })

<<<<<<< HEAD
  it('should result in false when comparing a something with NaN', function () {
=======
  it('should result in false when comparing a something with NaN', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    // Number
    assert.strictEqual(smaller(NaN, 3), false)
    assert.strictEqual(smaller(3, NaN), false)
    assert.strictEqual(smaller(NaN, NaN), false)

    // BigNumber
    assert.strictEqual(smaller(NaN, bignumber(3)), false)
    assert.strictEqual(smaller(bignumber(3), NaN), false)
    assert.strictEqual(smaller(3, bignumber(NaN)), false)
    assert.strictEqual(smaller(bignumber(NaN), 3), false)
    assert.strictEqual(smaller(bignumber(NaN), bignumber(3)), false)
    assert.strictEqual(smaller(bignumber(3), bignumber(NaN)), false)

    // Fraction
    assert.strictEqual(smaller(NaN, fraction(3)), false)
    assert.strictEqual(smaller(fraction(3), NaN), false)
    assert.strictEqual(smaller(fraction(3), bignumber(NaN)), false)
    assert.strictEqual(smaller(bignumber(NaN), fraction(3)), false)
    // A fraction itself will throw an error when it's NaN

    // Unit
    assert.strictEqual(smaller(unit('3', 's'), unit(NaN, 's')), false)
    assert.strictEqual(smaller(unit(NaN, 's'), unit('3', 's')), false)
    assert.strictEqual(smaller(unit(NaN, 's'), unit(NaN, 's')), false)
  })

<<<<<<< HEAD
  describe('Array', function () {
    it('should compare array - scalar', function () {
=======
  describe('Array', function (): void {
    it('should compare array - scalar', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(smaller(2, [1, 2, 3]), [false, false, true])
      assert.deepStrictEqual(smaller([1, 2, 3], 2), [true, false, false])
    })

<<<<<<< HEAD
    it('should compare array - array', function () {
=======
    it('should compare array - array', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        smaller(
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
          [false, false, false],
          [false, true, false]
        ]
      )
    })

<<<<<<< HEAD
    it('should compare broadcastable arrays', function () {
=======
    it('should compare broadcastable arrays', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(smaller([[1, 2, 0]], [[1], [-1]]), [
        [false, false, true],
        [false, false, false]
      ])
    })

<<<<<<< HEAD
    it('should compare array - dense matrix', function () {
=======
    it('should compare array - dense matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        smaller(
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
          [false, false, false],
          [false, true, false]
        ])
      )
    })

<<<<<<< HEAD
    it('should compare array - sparse matrix', function () {
=======
    it('should compare array - sparse matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        smaller(
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
          [false, false, false],
          [false, true, false]
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
        smaller([1, 4, 5], [3, 4])
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
        smaller(2, matrix([1, 2, 3])),
        matrix([false, false, true])
      )
      assert.deepStrictEqual(
        smaller(matrix([1, 2, 3]), 2),
        matrix([true, false, false])
      )
    })

<<<<<<< HEAD
    it('should compare dense matrix - array', function () {
=======
    it('should compare dense matrix - array', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        smaller(
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
          [false, false, false],
          [false, true, false]
        ])
      )
    })

<<<<<<< HEAD
    it('should compare dense matrix - dense matrix', function () {
=======
    it('should compare dense matrix - dense matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        smaller(
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
          [false, false, false],
          [false, true, false]
        ])
      )
    })

<<<<<<< HEAD
    it('should compare dense matrix - sparse matrix', function () {
=======
    it('should compare dense matrix - sparse matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        smaller(
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
          [false, false, false],
          [false, true, false]
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
        smaller(
          2,
          sparse([
            [1, 2],
            [3, 4]
          ])
        ),
        matrix([
          [false, false],
          [true, true]
        ])
      )
      assert.deepStrictEqual(
        smaller(
          sparse([
            [1, 2],
            [3, 4]
          ]),
          2
        ),
        matrix([
          [true, false],
          [false, false]
        ])
      )
    })

<<<<<<< HEAD
    it('should compare sparse matrix - array', function () {
=======
    it('should compare sparse matrix - array', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        smaller(
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
          [false, false, false],
          [false, true, false]
        ])
      )
    })

<<<<<<< HEAD
    it('should compare sparse matrix - dense matrix', function () {
=======
    it('should compare sparse matrix - dense matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        smaller(
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
          [false, false, false],
          [false, true, false]
        ])
      )
    })

<<<<<<< HEAD
    it('should compare sparse matrix - sparse matrix', function () {
=======
    it('should compare sparse matrix - sparse matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        smaller(
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
          [false, false, false],
          [false, true, false]
        ])
      )
    })
  })

<<<<<<< HEAD
  it('should throw an error when comparing complex numbers', function () {
    assert.throws(function () {
      smaller(complex(1, 1), complex(1, 2))
    }, TypeError)
    assert.throws(function () {
      smaller(complex(2, 1), 3)
    }, TypeError)
    assert.throws(function () {
      smaller(3, complex(2, 4))
    }, TypeError)
    assert.throws(function () {
      smaller(math.bignumber(3), complex(2, 4))
    }, TypeError)
    assert.throws(function () {
=======
  it('should throw an error when comparing complex numbers', function (): void {
    assert.throws(function (): void {
      smaller(complex(1, 1), complex(1, 2))
    }, TypeError)
    assert.throws(function (): void {
      smaller(complex(2, 1), 3)
    }, TypeError)
    assert.throws(function (): void {
      smaller(3, complex(2, 4))
    }, TypeError)
    assert.throws(function (): void {
      smaller(math.bignumber(3), complex(2, 4))
    }, TypeError)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      smaller(complex(2, 4), math.bignumber(3))
    }, TypeError)
  })

<<<<<<< HEAD
  it('should throw an error with two matrices of different sizes', function () {
    assert.throws(function () {
=======
  it('should throw an error with two matrices of different sizes', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      smaller([1, 4, 6], [3, 4])
    })
  })

<<<<<<< HEAD
  it('should throw an error in case of invalid number of arguments', function () {
    assert.throws(function () {
      smaller(1)
    }, /TypeError: Too few arguments/)
    assert.throws(function () {
=======
  it('should throw an error in case of invalid number of arguments', function (): void {
    assert.throws(function (): void {
      smaller(1)
    }, /TypeError: Too few arguments/)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      smaller(1, 2, 3)
    }, /TypeError: Too many arguments/)
  })

<<<<<<< HEAD
  it('should throw an error in case of invalid type of arguments', function () {
    assert.throws(function () {
=======
  it('should throw an error in case of invalid type of arguments', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      smaller(2, null)
    }, /TypeError: Unexpected type of argument/)
  })

<<<<<<< HEAD
  it('should LaTeX smaller', function () {
=======
  it('should LaTeX smaller', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const expression = math.parse('smaller(1,2)')
    assert.strictEqual(expression.toTex(), '\\left(1<2\\right)')
  })
})
