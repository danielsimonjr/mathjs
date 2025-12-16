<<<<<<< HEAD
// @ts-nocheck
=======
/**
 * Test for smallerEq - AssemblyScript-friendly TypeScript
 */
>>>>>>> claude/review-sprints-quality-checks-Rlfec
// test smaller
import assert from 'assert'

import math from '../../../../src/defaultInstance.ts'
const bignumber = math.bignumber
const complex = math.complex
const matrix = math.matrix
const sparse = math.sparse
const unit = math.unit
const smallerEq = math.smallerEq

<<<<<<< HEAD
describe('smallerEq', function () {
  it('should compare two numbers correctly', function () {
=======
interface MathNode {
  type: string
  toTex(): string
}

describe('smallerEq', function (): void {
  it('should compare two numbers correctly', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(smallerEq(2, 3), true)
    assert.strictEqual(smallerEq(2, 2), true)
    assert.strictEqual(smallerEq(2, 1), false)
    assert.strictEqual(smallerEq(0, 0), true)
    assert.strictEqual(smallerEq(-2, 2), true)
    assert.strictEqual(smallerEq(-2, -3), false)
    assert.strictEqual(smallerEq(-2, -2), true)
    assert.strictEqual(smallerEq(-3, -2), true)
  })

<<<<<<< HEAD
  it('should compare two numbers correctly', function () {
=======
  it('should compare two numbers correctly', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(smallerEq(2n, 3n), true)
    assert.strictEqual(smallerEq(2n, 2n), true)
    assert.strictEqual(smallerEq(2n, 1n), false)
    assert.strictEqual(smallerEq(0n, 0n), true)
    assert.strictEqual(smallerEq(-2n, 2n), true)
    assert.strictEqual(smallerEq(-2n, -3n), false)
    assert.strictEqual(smallerEq(-2n, -2n), true)
    assert.strictEqual(smallerEq(-3n, -2n), true)
  })

<<<<<<< HEAD
  it('should compare two floating point numbers correctly', function () {
=======
  it('should compare two floating point numbers correctly', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    // Infinity
    assert.strictEqual(
      smallerEq(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY),
      true
    )
    assert.strictEqual(
      smallerEq(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY),
      true
    )
    assert.strictEqual(
      smallerEq(Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY),
      false
    )
    assert.strictEqual(
      smallerEq(Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY),
      true
    )
    assert.strictEqual(smallerEq(Number.POSITIVE_INFINITY, 2.0), false)
    assert.strictEqual(smallerEq(2.0, Number.POSITIVE_INFINITY), true)
    assert.strictEqual(smallerEq(Number.NEGATIVE_INFINITY, 2.0), true)
    assert.strictEqual(smallerEq(2.0, Number.NEGATIVE_INFINITY), false)
    // floating point numbers
    assert.strictEqual(smallerEq(0.3 - 0.2, 0.1), true)
  })

<<<<<<< HEAD
  it('should compare two booleans', function () {
=======
  it('should compare two booleans', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(smallerEq(true, true), true)
    assert.strictEqual(smallerEq(true, false), false)
    assert.strictEqual(smallerEq(false, true), true)
    assert.strictEqual(smallerEq(false, false), true)
  })

<<<<<<< HEAD
  it('should compare mixed numbers and booleans', function () {
=======
  it('should compare mixed numbers and booleans', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(smallerEq(2, true), false)
    assert.strictEqual(smallerEq(1, true), true)
    assert.strictEqual(smallerEq(0, true), true)
    assert.strictEqual(smallerEq(true, 2), true)
    assert.strictEqual(smallerEq(true, 1), true)
    assert.strictEqual(smallerEq(false, 2), true)
  })

<<<<<<< HEAD
  it('should compare bignumbers', function () {
=======
  it('should compare bignumbers', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(smallerEq(bignumber(2), bignumber(3)), true)
    assert.deepStrictEqual(smallerEq(bignumber(2), bignumber(2)), true)
    assert.deepStrictEqual(smallerEq(bignumber(3), bignumber(2)), false)
    assert.deepStrictEqual(smallerEq(bignumber(0), bignumber(0)), true)
    assert.deepStrictEqual(smallerEq(bignumber(-2), bignumber(2)), true)
  })

<<<<<<< HEAD
  it('should compare mixed numbers and bignumbers', function () {
    assert.deepStrictEqual(smallerEq(bignumber(2), 3), true)
    assert.deepStrictEqual(smallerEq(2, bignumber(2)), true)

    assert.throws(function () {
      smallerEq(1 / 3, bignumber(1).div(3))
    }, /TypeError: Cannot implicitly convert a number with >15 significant digits to BigNumber/)
    assert.throws(function () {
=======
  it('should compare mixed numbers and bignumbers', function (): void {
    assert.deepStrictEqual(smallerEq(bignumber(2), 3), true)
    assert.deepStrictEqual(smallerEq(2, bignumber(2)), true)

    assert.throws(function (): void {
      smallerEq(1 / 3, bignumber(1).div(3))
    }, /TypeError: Cannot implicitly convert a number with >15 significant digits to BigNumber/)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      smallerEq(bignumber(1).div(3), 1 / 3)
    }, /TypeError: Cannot implicitly convert a number with >15 significant digits to BigNumber/)
  })

<<<<<<< HEAD
  it('should compare mixed numbers and bigints', function () {
    assert.deepStrictEqual(smallerEq(2n, 3), true)
    assert.deepStrictEqual(smallerEq(2, 2n), true)

    assert.throws(function () {
      smallerEq(123123123123123123123n, 1)
    }, /Cannot implicitly convert bigint to number: value exceeds the max safe integer value/)
    assert.throws(function () {
=======
  it('should compare mixed numbers and bigints', function (): void {
    assert.deepStrictEqual(smallerEq(2n, 3), true)
    assert.deepStrictEqual(smallerEq(2, 2n), true)

    assert.throws(function (): void {
      smallerEq(123123123123123123123n, 1)
    }, /Cannot implicitly convert bigint to number: value exceeds the max safe integer value/)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      smallerEq(1, 123123123123123123123n)
    }, /Cannot implicitly convert bigint to number: value exceeds the max safe integer value/)
  })

<<<<<<< HEAD
  it('should compare mixed booleans and bignumbers', function () {
=======
  it('should compare mixed booleans and bignumbers', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(smallerEq(bignumber(0.1), true), true)
    assert.deepStrictEqual(smallerEq(bignumber(1), true), true)
    assert.deepStrictEqual(smallerEq(bignumber(1), false), false)
    assert.deepStrictEqual(smallerEq(bignumber(0), false), true)
    assert.deepStrictEqual(smallerEq(false, bignumber(0)), true)
    assert.deepStrictEqual(smallerEq(true, bignumber(0)), false)
    assert.deepStrictEqual(smallerEq(true, bignumber(1)), true)
  })

<<<<<<< HEAD
  it('should compare two fractions', function () {
=======
  it('should compare two fractions', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(
      smallerEq(math.fraction(3), math.fraction(2)).valueOf(),
      false
    )
    assert.strictEqual(
      smallerEq(math.fraction(2), math.fraction(3)).valueOf(),
      true
    )
    assert.strictEqual(
      smallerEq(math.fraction(3), math.fraction(3)).valueOf(),
      true
    )
  })

<<<<<<< HEAD
  it('should compare mixed fractions and numbers', function () {
=======
  it('should compare mixed fractions and numbers', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(smallerEq(1, math.fraction(1, 3)), false)
    assert.strictEqual(smallerEq(math.fraction(2), 2), true)
  })

<<<<<<< HEAD
  it('should compare mixed fractions and bigints', function () {
=======
  it('should compare mixed fractions and bigints', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(smallerEq(1n, math.fraction(1, 3)), false)
    assert.strictEqual(smallerEq(math.fraction(2), 2n), true)
  })

<<<<<<< HEAD
  it('should compare two measures of the same unit correctly', function () {
=======
  it('should compare two measures of the same unit correctly', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(smallerEq(unit('100cm'), unit('10inch')), false)
    assert.strictEqual(smallerEq(unit('99cm'), unit('1m')), true)
    // assert.strictEqual(smallerEq(unit('100cm'), unit('1m')), true); // dangerous, round-off errors
    assert.strictEqual(smallerEq(unit('101cm'), unit('1m')), false)
  })

<<<<<<< HEAD
  it('should apply configuration option relTol', function () {
=======
  it('should apply configuration option relTol', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const mymath = math.create()
    assert.strictEqual(mymath.smallerEq(1.01, 1), false)
    assert.strictEqual(
      mymath.smallerEq(mymath.bignumber(1.01), mymath.bignumber(1)),
      false
    )

    mymath.config({ relTol: 1e-2 })
    assert.strictEqual(mymath.smallerEq(1.01, 1), true)
    assert.strictEqual(
      mymath.smallerEq(mymath.bignumber(1.01), mymath.bignumber(1)),
      true
    )
  })

<<<<<<< HEAD
  it('should throw an error if comparing a unit with a number', function () {
    assert.throws(function () {
      smallerEq(unit('100cm'), 22)
    })
    assert.throws(function () {
=======
  it('should throw an error if comparing a unit with a number', function (): void {
    assert.throws(function (): void {
      smallerEq(unit('100cm'), 22)
    })
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      smallerEq(22, unit('100cm'))
    })
  })

<<<<<<< HEAD
  it('should throw an error for two measures of different units', function () {
    assert.throws(function () {
=======
  it('should throw an error for two measures of different units', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      smallerEq(math.unit(5, 'km'), math.unit(100, 'gram'))
    })
  })

<<<<<<< HEAD
  it('should throw an error if comparing a unit with a bignumber', function () {
    assert.throws(function () {
      smallerEq(unit('100cm'), bignumber(22))
    })
    assert.throws(function () {
=======
  it('should throw an error if comparing a unit with a bignumber', function (): void {
    assert.throws(function (): void {
      smallerEq(unit('100cm'), bignumber(22))
    })
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      smallerEq(bignumber(22), unit('100cm'))
    })
  })

<<<<<<< HEAD
  it('should compare two strings by their numerical value', function () {
=======
  it('should compare two strings by their numerical value', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(smallerEq('0', 0), true)
    assert.strictEqual(smallerEq('10', '2'), false)
    assert.strictEqual(smallerEq('1e3', '1000'), true)

<<<<<<< HEAD
    assert.throws(function () {
=======
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      smallerEq('A', 'B')
    }, /Cannot convert "A" to a number/)
  })

<<<<<<< HEAD
  describe('Array', function () {
    it('should compare array - scalar', function () {
=======
  describe('Array', function (): void {
    it('should compare array - scalar', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(smallerEq(2, [1, 2, 3]), [false, true, true])
      assert.deepStrictEqual(smallerEq([1, 2, 3], 2), [true, true, false])
    })

<<<<<<< HEAD
    it('should compare array - array', function () {
=======
    it('should compare array - array', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        smallerEq(
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
          [true, false, true],
          [true, true, false]
        ]
      )
    })

<<<<<<< HEAD
    it('should compare broadcastable arrays', function () {
=======
    it('should compare broadcastable arrays', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(smallerEq([1, 2, 0], [[1], [-1]]), [
        [true, false, true],
        [false, false, false]
      ])
    })

<<<<<<< HEAD
    it('should compare array - dense matrix', function () {
=======
    it('should compare array - dense matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        smallerEq(
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
          [true, false, true],
          [true, true, false]
        ])
      )
    })

<<<<<<< HEAD
    it('should compare array - sparse matrix', function () {
=======
    it('should compare array - sparse matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        smallerEq(
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
          [true, false, true],
          [true, true, false]
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
        smallerEq([1, 4, 5], [3, 4])
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
        smallerEq(2, matrix([1, 2, 3])),
        matrix([false, true, true])
      )
      assert.deepStrictEqual(
        smallerEq(matrix([1, 2, 3]), 2),
        matrix([true, true, false])
      )
    })

<<<<<<< HEAD
    it('should compare dense matrix - array', function () {
=======
    it('should compare dense matrix - array', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        smallerEq(
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
          [true, false, true],
          [true, true, false]
        ])
      )
    })

<<<<<<< HEAD
    it('should compare dense matrix - dense matrix', function () {
=======
    it('should compare dense matrix - dense matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        smallerEq(
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
          [true, false, true],
          [true, true, false]
        ])
      )
    })

<<<<<<< HEAD
    it('should compare dense matrix - sparse matrix', function () {
=======
    it('should compare dense matrix - sparse matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        smallerEq(
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
          [true, false, true],
          [true, true, false]
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
        smallerEq(
          2,
          sparse([
            [1, 2],
            [3, 4]
          ])
        ),
        matrix([
          [false, true],
          [true, true]
        ])
      )
      assert.deepStrictEqual(
        smallerEq(
          sparse([
            [1, 2],
            [3, 4]
          ]),
          2
        ),
        matrix([
          [true, true],
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
        smallerEq(
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
          [true, false, true],
          [true, true, false]
        ])
      )
    })

<<<<<<< HEAD
    it('should compare sparse matrix - dense matrix', function () {
=======
    it('should compare sparse matrix - dense matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        smallerEq(
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
          [true, false, true],
          [true, true, false]
        ])
      )
    })

<<<<<<< HEAD
    it('should compare sparse matrix - sparse matrix', function () {
=======
    it('should compare sparse matrix - sparse matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        smallerEq(
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
          [true, false, true],
          [true, true, false]
        ])
      )
    })
  })

<<<<<<< HEAD
  it('should throw an error when comparing complex numbers', function () {
    assert.throws(function () {
      smallerEq(complex(1, 1), complex(1, 2))
    }, TypeError)
    assert.throws(function () {
      smallerEq(complex(2, 1), 3)
    }, TypeError)
    assert.throws(function () {
      smallerEq(3, complex(2, 4))
    }, TypeError)
    assert.throws(function () {
      smallerEq(math.bignumber(3), complex(2, 4))
    }, TypeError)
    assert.throws(function () {
=======
  it('should throw an error when comparing complex numbers', function (): void {
    assert.throws(function (): void {
      smallerEq(complex(1, 1), complex(1, 2))
    }, TypeError)
    assert.throws(function (): void {
      smallerEq(complex(2, 1), 3)
    }, TypeError)
    assert.throws(function (): void {
      smallerEq(3, complex(2, 4))
    }, TypeError)
    assert.throws(function (): void {
      smallerEq(math.bignumber(3), complex(2, 4))
    }, TypeError)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      smallerEq(complex(2, 4), math.bignumber(3))
    }, TypeError)
  })

<<<<<<< HEAD
  it('should throw an error with two matrices of different sizes', function () {
    assert.throws(function () {
=======
  it('should throw an error with two matrices of different sizes', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      smallerEq([1, 4, 6], [3, 4])
    })
  })

<<<<<<< HEAD
  it('should throw an error in case of invalid number of arguments', function () {
    assert.throws(function () {
      smallerEq(1)
    }, /TypeError: Too few arguments/)
    assert.throws(function () {
=======
  it('should throw an error in case of invalid number of arguments', function (): void {
    assert.throws(function (): void {
      smallerEq(1)
    }, /TypeError: Too few arguments/)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      smallerEq(1, 2, 3)
    }, /TypeError: Too many arguments/)
  })

<<<<<<< HEAD
  it('should throw an error in case of invalid type of arguments', function () {
    assert.throws(function () {
=======
  it('should throw an error in case of invalid type of arguments', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      smallerEq(2, null)
    }, /TypeError: Unexpected type of argument/)
  })

<<<<<<< HEAD
  it('should LaTeX smallerEq', function () {
=======
  it('should LaTeX smallerEq', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const expression = math.parse('smallerEq(1,2)')
    assert.strictEqual(expression.toTex(), '\\left(1\\leq2\\right)')
  })
})
