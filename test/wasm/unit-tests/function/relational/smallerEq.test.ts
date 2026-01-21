/**
 * Test for smallerEq - AssemblyScript-friendly TypeScript
 */
// test smaller
import assert from 'assert'

import math from '../../../../../src/defaultInstance.ts'
const bignumber = math.bignumber
const complex = math.complex
const matrix = math.matrix
const sparse = math.sparse
const unit = math.unit
const smallerEq = math.smallerEq

interface MathNode {
  type: string
  toTex(): string
}

describe('smallerEq', function (): void {
  it('should compare two numbers correctly', function (): void {
    assert.strictEqual(smallerEq(2, 3), true)
    assert.strictEqual(smallerEq(2, 2), true)
    assert.strictEqual(smallerEq(2, 1), false)
    assert.strictEqual(smallerEq(0, 0), true)
    assert.strictEqual(smallerEq(-2, 2), true)
    assert.strictEqual(smallerEq(-2, -3), false)
    assert.strictEqual(smallerEq(-2, -2), true)
    assert.strictEqual(smallerEq(-3, -2), true)
  })

  it('should compare two numbers correctly', function (): void {
    assert.strictEqual(smallerEq(2n, 3n), true)
    assert.strictEqual(smallerEq(2n, 2n), true)
    assert.strictEqual(smallerEq(2n, 1n), false)
    assert.strictEqual(smallerEq(0n, 0n), true)
    assert.strictEqual(smallerEq(-2n, 2n), true)
    assert.strictEqual(smallerEq(-2n, -3n), false)
    assert.strictEqual(smallerEq(-2n, -2n), true)
    assert.strictEqual(smallerEq(-3n, -2n), true)
  })

  it('should compare two floating point numbers correctly', function (): void {
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

  it('should compare two booleans', function (): void {
    assert.strictEqual(smallerEq(true, true), true)
    assert.strictEqual(smallerEq(true, false), false)
    assert.strictEqual(smallerEq(false, true), true)
    assert.strictEqual(smallerEq(false, false), true)
  })

  it('should compare mixed numbers and booleans', function (): void {
    assert.strictEqual(smallerEq(2, true), false)
    assert.strictEqual(smallerEq(1, true), true)
    assert.strictEqual(smallerEq(0, true), true)
    assert.strictEqual(smallerEq(true, 2), true)
    assert.strictEqual(smallerEq(true, 1), true)
    assert.strictEqual(smallerEq(false, 2), true)
  })

  it('should compare bignumbers', function (): void {
    assert.deepStrictEqual(smallerEq(bignumber(2), bignumber(3)), true)
    assert.deepStrictEqual(smallerEq(bignumber(2), bignumber(2)), true)
    assert.deepStrictEqual(smallerEq(bignumber(3), bignumber(2)), false)
    assert.deepStrictEqual(smallerEq(bignumber(0), bignumber(0)), true)
    assert.deepStrictEqual(smallerEq(bignumber(-2), bignumber(2)), true)
  })

  it('should compare mixed numbers and bignumbers', function (): void {
    assert.deepStrictEqual(smallerEq(bignumber(2), 3), true)
    assert.deepStrictEqual(smallerEq(2, bignumber(2)), true)

    assert.throws(function (): void {
      smallerEq(1 / 3, bignumber(1).div(3))
    }, /TypeError: Cannot implicitly convert a number with >15 significant digits to BigNumber/)
    assert.throws(function (): void {
      smallerEq(bignumber(1).div(3), 1 / 3)
    }, /TypeError: Cannot implicitly convert a number with >15 significant digits to BigNumber/)
  })

  it('should compare mixed numbers and bigints', function (): void {
    assert.deepStrictEqual(smallerEq(2n, 3), true)
    assert.deepStrictEqual(smallerEq(2, 2n), true)

    assert.throws(function (): void {
      smallerEq(123123123123123123123n, 1)
    }, /Cannot implicitly convert bigint to number: value exceeds the max safe integer value/)
    assert.throws(function (): void {
      smallerEq(1, 123123123123123123123n)
    }, /Cannot implicitly convert bigint to number: value exceeds the max safe integer value/)
  })

  it('should compare mixed booleans and bignumbers', function (): void {
    assert.deepStrictEqual(smallerEq(bignumber(0.1), true), true)
    assert.deepStrictEqual(smallerEq(bignumber(1), true), true)
    assert.deepStrictEqual(smallerEq(bignumber(1), false), false)
    assert.deepStrictEqual(smallerEq(bignumber(0), false), true)
    assert.deepStrictEqual(smallerEq(false, bignumber(0)), true)
    assert.deepStrictEqual(smallerEq(true, bignumber(0)), false)
    assert.deepStrictEqual(smallerEq(true, bignumber(1)), true)
  })

  it('should compare two fractions', function (): void {
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

  it('should compare mixed fractions and numbers', function (): void {
    assert.strictEqual(smallerEq(1, math.fraction(1, 3)), false)
    assert.strictEqual(smallerEq(math.fraction(2), 2), true)
  })

  it('should compare mixed fractions and bigints', function (): void {
    assert.strictEqual(smallerEq(1n, math.fraction(1, 3)), false)
    assert.strictEqual(smallerEq(math.fraction(2), 2n), true)
  })

  it('should compare two measures of the same unit correctly', function (): void {
    assert.strictEqual(smallerEq(unit('100cm'), unit('10inch')), false)
    assert.strictEqual(smallerEq(unit('99cm'), unit('1m')), true)
    // assert.strictEqual(smallerEq(unit('100cm'), unit('1m')), true); // dangerous, round-off errors
    assert.strictEqual(smallerEq(unit('101cm'), unit('1m')), false)
  })

  it('should apply configuration option relTol', function (): void {
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

  it('should throw an error if comparing a unit with a number', function (): void {
    assert.throws(function (): void {
      smallerEq(unit('100cm'), 22)
    })
    assert.throws(function (): void {
      smallerEq(22, unit('100cm'))
    })
  })

  it('should throw an error for two measures of different units', function (): void {
    assert.throws(function (): void {
      smallerEq(math.unit(5, 'km'), math.unit(100, 'gram'))
    })
  })

  it('should throw an error if comparing a unit with a bignumber', function (): void {
    assert.throws(function (): void {
      smallerEq(unit('100cm'), bignumber(22))
    })
    assert.throws(function (): void {
      smallerEq(bignumber(22), unit('100cm'))
    })
  })

  it('should compare two strings by their numerical value', function (): void {
    assert.strictEqual(smallerEq('0', 0), true)
    assert.strictEqual(smallerEq('10', '2'), false)
    assert.strictEqual(smallerEq('1e3', '1000'), true)

    assert.throws(function (): void {
      smallerEq('A', 'B')
    }, /Cannot convert "A" to a number/)
  })

  describe('Array', function (): void {
    it('should compare array - scalar', function (): void {
      assert.deepStrictEqual(smallerEq(2, [1, 2, 3]), [false, true, true])
      assert.deepStrictEqual(smallerEq([1, 2, 3], 2), [true, true, false])
    })

    it('should compare array - array', function (): void {
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

    it('should compare broadcastable arrays', function (): void {
      assert.deepStrictEqual(smallerEq([1, 2, 0], [[1], [-1]]), [
        [true, false, true],
        [false, false, false]
      ])
    })

    it('should compare array - dense matrix', function (): void {
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

    it('should compare array - sparse matrix', function (): void {
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

    it('should throw an error if arrays have different sizes', function (): void {
      assert.throws(function (): void {
        smallerEq([1, 4, 5], [3, 4])
      })
    })
  })

  describe('DenseMatrix', function (): void {
    it('should compare dense matrix - scalar', function (): void {
      assert.deepStrictEqual(
        smallerEq(2, matrix([1, 2, 3])),
        matrix([false, true, true])
      )
      assert.deepStrictEqual(
        smallerEq(matrix([1, 2, 3]), 2),
        matrix([true, true, false])
      )
    })

    it('should compare dense matrix - array', function (): void {
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

    it('should compare dense matrix - dense matrix', function (): void {
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

    it('should compare dense matrix - sparse matrix', function (): void {
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

  describe('SparseMatrix', function (): void {
    it('should compare sparse matrix - scalar', function (): void {
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

    it('should compare sparse matrix - array', function (): void {
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

    it('should compare sparse matrix - dense matrix', function (): void {
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

    it('should compare sparse matrix - sparse matrix', function (): void {
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
      smallerEq(complex(2, 4), math.bignumber(3))
    }, TypeError)
  })

  it('should throw an error with two matrices of different sizes', function (): void {
    assert.throws(function (): void {
      smallerEq([1, 4, 6], [3, 4])
    })
  })

  it('should throw an error in case of invalid number of arguments', function (): void {
    assert.throws(function (): void {
      smallerEq(1)
    }, /TypeError: Too few arguments/)
    assert.throws(function (): void {
      smallerEq(1, 2, 3)
    }, /TypeError: Too many arguments/)
  })

  it('should throw an error in case of invalid type of arguments', function (): void {
    assert.throws(function (): void {
      smallerEq(2, null)
    }, /TypeError: Unexpected type of argument/)
  })

  it('should LaTeX smallerEq', function (): void {
    const expression = math.parse('smallerEq(1,2)')
    assert.strictEqual(expression.toTex(), '\\left(1\\leq2\\right)')
  })
})
