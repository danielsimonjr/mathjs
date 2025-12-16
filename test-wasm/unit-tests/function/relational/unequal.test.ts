<<<<<<< HEAD
// @ts-nocheck
=======
/**
 * Test for unequal - AssemblyScript-friendly TypeScript
 */
>>>>>>> claude/review-sprints-quality-checks-Rlfec
// test unequal
import assert from 'assert'

import math from '../../../../src/defaultInstance.ts'
const bignumber = math.bignumber
const complex = math.complex
const matrix = math.matrix
const sparse = math.sparse
const unit = math.unit
const unequal = math.unequal

<<<<<<< HEAD
describe('unequal', function () {
  it('should compare two numbers correctly', function () {
=======
interface MathNode {
  type: string
  toTex(): string
}

describe('unequal', function (): void {
  it('should compare two numbers correctly', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(unequal(2, 3), true)
    assert.strictEqual(unequal(2, 2), false)
    assert.strictEqual(unequal(0, 0), false)
    assert.strictEqual(unequal(-2, 2), true)
    assert.strictEqual(unequal(true, 1), false)
  })

<<<<<<< HEAD
  it('should compare two bigints correctly', function () {
=======
  it('should compare two bigints correctly', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(unequal(2n, 3n), true)
    assert.strictEqual(unequal(2n, 2n), false)
    assert.strictEqual(unequal(0n, 0n), false)
    assert.strictEqual(unequal(-2n, 2n), true)
    assert.strictEqual(unequal(true, 1n), false)
  })

<<<<<<< HEAD
  it('should compare two floating point numbers correctly', function () {
=======
  it('should compare two floating point numbers correctly', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    // NaN
    assert.strictEqual(unequal(Number.NaN, Number.NaN), true)
    // Infinity
    assert.strictEqual(
      unequal(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY),
      false
    )
    assert.strictEqual(
      unequal(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY),
      false
    )
    assert.strictEqual(
      unequal(Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY),
      true
    )
    assert.strictEqual(
      unequal(Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY),
      true
    )
    assert.strictEqual(unequal(Number.POSITIVE_INFINITY, 2.0), true)
    assert.strictEqual(unequal(2.0, Number.POSITIVE_INFINITY), true)
    assert.strictEqual(unequal(Number.NEGATIVE_INFINITY, 2.0), true)
    assert.strictEqual(unequal(2.0, Number.NEGATIVE_INFINITY), true)
    assert.strictEqual(unequal(Number.NaN, Number.POSITIVE_INFINITY), true)
    assert.strictEqual(unequal(Number.POSITIVE_INFINITY, Number.NaN), true)
    assert.strictEqual(unequal(Number.NaN, Number.NEGATIVE_INFINITY), true)
    assert.strictEqual(unequal(Number.NEGATIVE_INFINITY, Number.NaN), true)
    // floating point numbers
    assert.strictEqual(unequal(0.3 - 0.2, 0.1), false)
  })

<<<<<<< HEAD
  it('should compare two booleans', function () {
=======
  it('should compare two booleans', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(unequal(true, true), false)
    assert.strictEqual(unequal(true, false), true)
    assert.strictEqual(unequal(false, true), true)
    assert.strictEqual(unequal(false, false), false)
  })

<<<<<<< HEAD
  it('should compare mixed numbers and booleans', function () {
=======
  it('should compare mixed numbers and booleans', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(unequal(2, true), true)
    assert.strictEqual(unequal(1, true), false)
    assert.strictEqual(unequal(0, true), true)
    assert.strictEqual(unequal(true, 2), true)
    assert.strictEqual(unequal(true, 1), false)
    assert.strictEqual(unequal(false, 2), true)
    assert.strictEqual(unequal(false, 0), false)
  })

<<<<<<< HEAD
  it('should compare bignumbers', function () {
=======
  it('should compare bignumbers', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(unequal(bignumber(2), bignumber(3)), true)
    assert.deepStrictEqual(unequal(bignumber(2), bignumber(2)), false)
    assert.deepStrictEqual(unequal(bignumber(3), bignumber(2)), true)
    assert.deepStrictEqual(unequal(bignumber(0), bignumber(0)), false)
    assert.deepStrictEqual(unequal(bignumber(-2), bignumber(2)), true)
  })

<<<<<<< HEAD
  it('should compare mixed numbers and bignumbers', function () {
    assert.deepStrictEqual(unequal(bignumber(2), 3), true)
    assert.deepStrictEqual(unequal(2, bignumber(2)), false)

    assert.throws(function () {
      unequal(1 / 3, bignumber(1).div(3))
    }, /TypeError: Cannot implicitly convert a number with >15 significant digits to BigNumber/)
    assert.throws(function () {
=======
  it('should compare mixed numbers and bignumbers', function (): void {
    assert.deepStrictEqual(unequal(bignumber(2), 3), true)
    assert.deepStrictEqual(unequal(2, bignumber(2)), false)

    assert.throws(function (): void {
      unequal(1 / 3, bignumber(1).div(3))
    }, /TypeError: Cannot implicitly convert a number with >15 significant digits to BigNumber/)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      unequal(bignumber(1).div(3), 1 / 3)
    }, /TypeError: Cannot implicitly convert a number with >15 significant digits to BigNumber/)
  })

<<<<<<< HEAD
  it('should compare mixed numbers and bigints', function () {
    assert.deepStrictEqual(unequal(2n, 3), true)
    assert.deepStrictEqual(unequal(2, 2n), false)

    assert.throws(function () {
      unequal(123123123123123123123n, 1)
    }, /Cannot implicitly convert bigint to number: value exceeds the max safe integer value/)
    assert.throws(function () {
=======
  it('should compare mixed numbers and bigints', function (): void {
    assert.deepStrictEqual(unequal(2n, 3), true)
    assert.deepStrictEqual(unequal(2, 2n), false)

    assert.throws(function (): void {
      unequal(123123123123123123123n, 1)
    }, /Cannot implicitly convert bigint to number: value exceeds the max safe integer value/)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      unequal(1, 123123123123123123123n)
    }, /Cannot implicitly convert bigint to number: value exceeds the max safe integer value/)
  })

<<<<<<< HEAD
  it('should compare mixed booleans and bignumbers', function () {
=======
  it('should compare mixed booleans and bignumbers', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(unequal(bignumber(0.1), true), true)
    assert.deepStrictEqual(unequal(bignumber(1), true), false)
    assert.deepStrictEqual(unequal(bignumber(1), false), true)
    assert.deepStrictEqual(unequal(bignumber(0), false), false)
    assert.deepStrictEqual(unequal(false, bignumber(0)), false)
    assert.deepStrictEqual(unequal(true, bignumber(0)), true)
    assert.deepStrictEqual(unequal(true, bignumber(1)), false)
  })

<<<<<<< HEAD
  it('should compare two complex numbers correctly', function () {
=======
  it('should compare two complex numbers correctly', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(unequal(complex(2, 3), complex(2, 4)), true)
    assert.strictEqual(unequal(complex(2, 3), complex(2, 3)), false)
    assert.strictEqual(unequal(complex(1, 3), complex(2, 3)), true)
    assert.strictEqual(unequal(complex(1, 3), complex(2, 4)), true)
    assert.strictEqual(unequal(complex(2, 0), 2), false)
    assert.strictEqual(unequal(complex(2, 1), 2), true)
    assert.strictEqual(unequal(2, complex(2, 0)), false)
    assert.strictEqual(unequal(2, complex(2, 1)), true)
    assert.strictEqual(unequal(complex(2, 0), 3), true)
  })

<<<<<<< HEAD
  it('should compare mixed complex numbers and bignumbers (downgrades to numbers)', function () {
=======
  it('should compare mixed complex numbers and bignumbers (downgrades to numbers)', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(unequal(math.complex(6, 0), bignumber(6)), false)
    assert.deepStrictEqual(unequal(math.complex(6, -2), bignumber(6)), true)
    assert.deepStrictEqual(unequal(bignumber(6), math.complex(6, 0)), false)
    assert.deepStrictEqual(unequal(bignumber(6), math.complex(6, 4)), true)
  })

<<<<<<< HEAD
  it('should compare two fractions', function () {
=======
  it('should compare two fractions', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(
      unequal(math.fraction(3), math.fraction(2)).valueOf(),
      true
    )
    assert.strictEqual(
      unequal(math.fraction(2), math.fraction(3)).valueOf(),
      true
    )
    assert.strictEqual(
      unequal(math.fraction(3), math.fraction(3)).valueOf(),
      false
    )
  })

<<<<<<< HEAD
  it('should compare mixed fractions and numbers', function () {
=======
  it('should compare mixed fractions and numbers', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(unequal(1, math.fraction(1, 3)), true)
    assert.strictEqual(unequal(math.fraction(2), 2), false)
  })

<<<<<<< HEAD
  it('should compare two quantitites of the same unit correctly', function () {
=======
  it('should compare two quantitites of the same unit correctly', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(unequal(unit('100cm'), unit('10inch')), true)
    assert.strictEqual(unequal(unit('100cm'), unit('1m')), false)
    // assert.strictEqual(unequal(unit('12inch'), unit('1foot')), false); // round-off error :(
    // assert.strictEqual(unequal(unit('2.54cm'), unit('1inch')), false); // round-off error :(
  })

<<<<<<< HEAD
  it('should compare null', function () {
=======
  it('should compare null', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(unequal(null, null), false)
    assert.strictEqual(unequal(null, undefined), true)
    assert.strictEqual(unequal(0, null), true)
    assert.strictEqual(unequal('null', null), true)
  })

<<<<<<< HEAD
  it('should compare undefined', function () {
=======
  it('should compare undefined', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(unequal(undefined, undefined), false)
    assert.strictEqual(unequal(undefined, 'undefined'), true)
    assert.strictEqual(unequal(undefined, null), true)
    assert.strictEqual(unequal(2, undefined), true)
  })

<<<<<<< HEAD
  it('should apply configuration option relTol', function () {
=======
  it('should apply configuration option relTol', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const mymath = math.create()
    assert.strictEqual(mymath.unequal(1, 0.991), true)
    assert.strictEqual(
      mymath.unequal(mymath.bignumber(1), mymath.bignumber(0.991)),
      true
    )
    assert.strictEqual(
      mymath.unequal(mymath.complex(1, 0), mymath.complex(0.991, 0)),
      true
    )

    mymath.config({ relTol: 1e-2 })
    assert.strictEqual(mymath.unequal(1, 0.991), false)
    assert.strictEqual(
      mymath.unequal(mymath.bignumber(1), mymath.bignumber(0.991)),
      false
    )
    assert.strictEqual(
      mymath.unequal(mymath.complex(1, 0), mymath.complex(0.991, 0)),
      false
    )
  })

<<<<<<< HEAD
  it('should throw an error when comparing numbers and units', function () {
    assert.throws(function () {
      unequal(unit('100cm'), 22)
    })
    assert.throws(function () {
=======
  it('should throw an error when comparing numbers and units', function (): void {
    assert.throws(function (): void {
      unequal(unit('100cm'), 22)
    })
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      unequal(22, unit('100cm'))
    })
  })

<<<<<<< HEAD
  it('should throw an error when comparing bignumbers and units', function () {
    assert.throws(function () {
      unequal(unit('100cm'), bignumber(22))
    })
    assert.throws(function () {
=======
  it('should throw an error when comparing bignumbers and units', function (): void {
    assert.throws(function (): void {
      unequal(unit('100cm'), bignumber(22))
    })
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      unequal(bignumber(22), unit('100cm'))
    })
  })

<<<<<<< HEAD
  it('should throw an error for two measures of different units', function () {
    assert.throws(function () {
=======
  it('should throw an error for two measures of different units', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      unequal(math.unit(5, 'km'), math.unit(100, 'gram'))
    })
  })

<<<<<<< HEAD
  it('should compare two strings by their numerical value', function () {
=======
  it('should compare two strings by their numerical value', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(unequal('0', 0), false)
    assert.strictEqual(unequal('1000', '1e3'), false)
    assert.strictEqual(unequal('20', '1'), true)

<<<<<<< HEAD
    assert.throws(function () {
=======
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      unequal('A', 'B')
    }, /Cannot convert "A" to a number/)
  })

<<<<<<< HEAD
  describe('Array', function () {
    it('should compare array - scalar', function () {
=======
  describe('Array', function (): void {
    it('should compare array - scalar', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(unequal(2, [1, 2, 3]), [true, false, true])
      assert.deepStrictEqual(unequal([1, 2, 3], 2), [true, false, true])
    })

<<<<<<< HEAD
    it('should compare array - array', function () {
=======
    it('should compare array - array', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        unequal(
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
          [false, true, true]
        ]
      )
    })

<<<<<<< HEAD
    it('should compare broadcastable arrays', function () {
=======
    it('should compare broadcastable arrays', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(unequal([1, 2, 0], [[1], [0]]), [
        [false, true, true],
        [true, true, false]
      ])
    })

<<<<<<< HEAD
    it('should compare array - dense matrix', function () {
=======
    it('should compare array - dense matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        unequal(
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
          [false, true, true]
        ])
      )
    })

<<<<<<< HEAD
    it('should compare array - sparse matrix', function () {
=======
    it('should compare array - sparse matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        unequal(
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
          [false, true, true]
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
        unequal([1, 4, 5], [3, 4])
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
        unequal(2, matrix([1, 2, 3])),
        matrix([true, false, true])
      )
      assert.deepStrictEqual(
        unequal(matrix([1, 2, 3]), 2),
        matrix([true, false, true])
      )
    })

<<<<<<< HEAD
    it('should compare dense matrix - array', function () {
=======
    it('should compare dense matrix - array', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        unequal(
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
          [false, true, true]
        ])
      )
    })

<<<<<<< HEAD
    it('should compare dense matrix - dense matrix', function () {
=======
    it('should compare dense matrix - dense matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        unequal(
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
          [false, true, true]
        ])
      )
    })

<<<<<<< HEAD
    it('should compare dense matrix - sparse matrix', function () {
=======
    it('should compare dense matrix - sparse matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        unequal(
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
          [false, true, true]
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
        unequal(
          2,
          sparse([
            [1, 2],
            [3, 4]
          ])
        ),
        matrix([
          [true, false],
          [true, true]
        ])
      )
      assert.deepStrictEqual(
        unequal(
          sparse([
            [1, 2],
            [3, 4]
          ]),
          2
        ),
        matrix([
          [true, false],
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
        unequal(
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
          [false, true, true]
        ])
      )
    })

<<<<<<< HEAD
    it('should compare sparse matrix - dense matrix', function () {
=======
    it('should compare sparse matrix - dense matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        unequal(
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
          [false, true, true]
        ])
      )
    })

<<<<<<< HEAD
    it('should compare sparse matrix - sparse matrix', function () {
=======
    it('should compare sparse matrix - sparse matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        unequal(
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
          [false, true, true]
        ])
      )
    })
  })

<<<<<<< HEAD
  it('should throw an error if matrices have different sizes', function () {
    assert.throws(function () {
=======
  it('should throw an error if matrices have different sizes', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      unequal([1, 4, 5], [3, 4])
    })
  })

<<<<<<< HEAD
  it('should throw an error in case of invalid number of arguments', function () {
    assert.throws(function () {
      unequal(1)
    }, /TypeError: Too few arguments/)
    assert.throws(function () {
=======
  it('should throw an error in case of invalid number of arguments', function (): void {
    assert.throws(function (): void {
      unequal(1)
    }, /TypeError: Too few arguments/)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      unequal(1, 2, 3)
    }, /TypeError: Too many arguments/)
  })

<<<<<<< HEAD
  it('should LaTeX unequal', function () {
=======
  it('should LaTeX unequal', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const expression = math.parse('unequal(1,0)')
    assert.strictEqual(expression.toTex(), '\\left(1\\neq0\\right)')
  })
})
