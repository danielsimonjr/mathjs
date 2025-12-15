/**
 * Test for smaller - AssemblyScript-friendly TypeScript
 */
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

interface MathNode {
  type: string
  toTex(): string
}

describe('smaller', function (): void {
  it('should compare two numbers correctly', function (): void {
    assert.strictEqual(smaller(2, 3), true)
    assert.strictEqual(smaller(2, 2), false)
    assert.strictEqual(smaller(2, 1), false)
    assert.strictEqual(smaller(0, 0), false)
    assert.strictEqual(smaller(-2, 2), true)
    assert.strictEqual(smaller(-2, -3), false)
    assert.strictEqual(smaller(-3, -2), true)
  })

  it('should compare two bigints correctly', function (): void {
    assert.strictEqual(smaller(2n, 3n), true)
    assert.strictEqual(smaller(2n, 2n), false)
    assert.strictEqual(smaller(2n, 1n), false)
    assert.strictEqual(smaller(0n, 0n), false)
    assert.strictEqual(smaller(-2n, 2n), true)
    assert.strictEqual(smaller(-2n, -3n), false)
    assert.strictEqual(smaller(-3n, -2n), true)
  })

  it('should compare two floating point numbers correctly', function (): void {
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

  it('should compare two booleans', function (): void {
    assert.strictEqual(smaller(true, true), false)
    assert.strictEqual(smaller(true, false), false)
    assert.strictEqual(smaller(false, true), true)
    assert.strictEqual(smaller(false, false), false)
  })

  it('should compare mixed numbers and booleans', function (): void {
    assert.strictEqual(smaller(2, true), false)
    assert.strictEqual(smaller(1, true), false)
    assert.strictEqual(smaller(0, true), true)
    assert.strictEqual(smaller(true, 2), true)
    assert.strictEqual(smaller(true, 1), false)
    assert.strictEqual(smaller(false, 2), true)
  })

  it('should compare bignumbers', function (): void {
    assert.deepStrictEqual(smaller(bignumber(2), bignumber(3)), true)
    assert.deepStrictEqual(smaller(bignumber(2), bignumber(2)), false)
    assert.deepStrictEqual(smaller(bignumber(3), bignumber(2)), false)
    assert.deepStrictEqual(smaller(bignumber(0), bignumber(0)), false)
    assert.deepStrictEqual(smaller(bignumber(-2), bignumber(2)), true)
  })

  it('should compare mixed numbers and bignumbers', function (): void {
    assert.deepStrictEqual(smaller(bignumber(2), 3), true)
    assert.deepStrictEqual(smaller(2, bignumber(2)), false)

    // assert.strictEqual(smaller(1/3, bignumber(1).div(3)), false)
    // assert.strictEqual(smaller(bignumber(1).div(3), 1/3), false)

    assert.throws(function (): void {
      smaller(1 / 3, bignumber(1).div(3))
    }, /Cannot implicitly convert a number with >15 significant digits to BigNumber/)
    assert.throws(function (): void {
      smaller(bignumber(1).div(3), 1 / 3)
    }, /Cannot implicitly convert a number with >15 significant digits to BigNumber/)
  })

  it('should compare mixed numbers and bigints', function (): void {
    assert.deepStrictEqual(smaller(2n, 3), true)
    assert.deepStrictEqual(smaller(2, 2n), false)

    assert.throws(function (): void {
      smaller(123123123123123123123n, 1)
    }, /Cannot implicitly convert bigint to number: value exceeds the max safe integer value/)
    assert.throws(function (): void {
      smaller(1, 123123123123123123123n)
    }, /Cannot implicitly convert bigint to number: value exceeds the max safe integer value/)
  })

  it('should compare mixed booleans and bignumbers', function (): void {
    assert.deepStrictEqual(smaller(bignumber(0.1), true), true)
    assert.deepStrictEqual(smaller(bignumber(1), true), false)
    assert.deepStrictEqual(smaller(bignumber(1), false), false)
    assert.deepStrictEqual(smaller(bignumber(0), false), false)
    assert.deepStrictEqual(smaller(false, bignumber(0)), false)
    assert.deepStrictEqual(smaller(true, bignumber(0)), false)
    assert.deepStrictEqual(smaller(true, bignumber(1)), false)
  })

  it('should compare two fractions', function (): void {
    assert.strictEqual(smaller(fraction(3), fraction(2)).valueOf(), false)
    assert.strictEqual(smaller(fraction(2), fraction(3)).valueOf(), true)
    assert.strictEqual(smaller(fraction(3), fraction(3)).valueOf(), false)
  })

  it('should compare mixed fractions and numbers', function (): void {
    assert.strictEqual(smaller(1, fraction(1, 3)), false)
    assert.strictEqual(smaller(fraction(2), 2), false)
  })

  it('should compare mixed fractions and bigints', function (): void {
    assert.strictEqual(smaller(1n, fraction(1, 3)), false)
    assert.strictEqual(smaller(fraction(2), 2n), false)
  })

  it('should compare mixed fractions and bignumbers', function (): void {
    assert.strictEqual(smaller(bignumber(1), fraction(1, 3)), false)
    assert.strictEqual(smaller(fraction(2), bignumber(2)), false)
  })

  it('should compare two measures of the same unit correctly', function (): void {
    assert.strictEqual(smaller(unit('100cm'), unit('10inch')), false)
    assert.strictEqual(smaller(unit('99cm'), unit('1m')), true)
    // assert.strictEqual(smaller(unit('100cm'), unit('1m')), false); // dangerous, round-off errors
    assert.strictEqual(smaller(unit('101cm'), unit('1m')), false)
  })

  it('should apply configuration option relTol', function (): void {
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

  it('should throw an error if comparing a unit and a number', function (): void {
    assert.throws(function (): void {
      smaller(unit('100cm'), 22)
    })
  })

  it('should throw an error for two measures of different units', function (): void {
    assert.throws(function (): void {
      smaller(math.unit(5, 'km'), math.unit(100, 'gram'))
    })
  })

  it('should throw an error if comparing a unit and a bignumber', function (): void {
    assert.throws(function (): void {
      smaller(unit('100cm'), bignumber(22))
    })
  })

  it('should compare two strings by their numerical value', function (): void {
    assert.strictEqual(smaller('0', 0), false)
    assert.strictEqual(smaller('10', '2'), false)
    assert.strictEqual(smaller('1e3', '1000'), false)

    assert.throws(function (): void {
      smaller('A', 'B')
    }, /Cannot convert "A" to a number/)
  })

  it('should result in false when comparing a something with NaN', function (): void {
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

  describe('Array', function (): void {
    it('should compare array - scalar', function (): void {
      assert.deepStrictEqual(smaller(2, [1, 2, 3]), [false, false, true])
      assert.deepStrictEqual(smaller([1, 2, 3], 2), [true, false, false])
    })

    it('should compare array - array', function (): void {
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

    it('should compare broadcastable arrays', function (): void {
      assert.deepStrictEqual(smaller([[1, 2, 0]], [[1], [-1]]), [
        [false, false, true],
        [false, false, false]
      ])
    })

    it('should compare array - dense matrix', function (): void {
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

    it('should compare array - sparse matrix', function (): void {
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

    it('should throw an error if arrays have different sizes', function (): void {
      assert.throws(function (): void {
        smaller([1, 4, 5], [3, 4])
      })
    })
  })

  describe('DenseMatrix', function (): void {
    it('should compare dense matrix - scalar', function (): void {
      assert.deepStrictEqual(
        smaller(2, matrix([1, 2, 3])),
        matrix([false, false, true])
      )
      assert.deepStrictEqual(
        smaller(matrix([1, 2, 3]), 2),
        matrix([true, false, false])
      )
    })

    it('should compare dense matrix - array', function (): void {
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

    it('should compare dense matrix - dense matrix', function (): void {
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

    it('should compare dense matrix - sparse matrix', function (): void {
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

  describe('SparseMatrix', function (): void {
    it('should compare sparse matrix - scalar', function (): void {
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

    it('should compare sparse matrix - array', function (): void {
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

    it('should compare sparse matrix - dense matrix', function (): void {
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

    it('should compare sparse matrix - sparse matrix', function (): void {
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
      smaller(complex(2, 4), math.bignumber(3))
    }, TypeError)
  })

  it('should throw an error with two matrices of different sizes', function (): void {
    assert.throws(function (): void {
      smaller([1, 4, 6], [3, 4])
    })
  })

  it('should throw an error in case of invalid number of arguments', function (): void {
    assert.throws(function (): void {
      smaller(1)
    }, /TypeError: Too few arguments/)
    assert.throws(function (): void {
      smaller(1, 2, 3)
    }, /TypeError: Too many arguments/)
  })

  it('should throw an error in case of invalid type of arguments', function (): void {
    assert.throws(function (): void {
      smaller(2, null)
    }, /TypeError: Unexpected type of argument/)
  })

  it('should LaTeX smaller', function (): void {
    const expression = math.parse('smaller(1,2)')
    assert.strictEqual(expression.toTex(), '\\left(1<2\\right)')
  })
})
