/**
 * Test for compare - AssemblyScript-friendly TypeScript
 */
// test compare
import assert from 'assert'

import math from '../../../../src/defaultInstance.ts'
const bignumber = math.bignumber
const complex = math.complex
const matrix = math.matrix
const sparse = math.sparse
const unit = math.unit
const compare = math.compare

interface MathNode {
  type: string
  toTex(): string
}

describe('compare', function (): void {
  it('should compare two numbers correctly', function (): void {
    assert.strictEqual(compare(2, 3), -1)
    assert.strictEqual(compare(2, 2), 0)
    assert.strictEqual(compare(2, 1), 1)
    assert.strictEqual(compare(0, 0), 0)
    assert.strictEqual(compare(-2, 2), -1)
    assert.strictEqual(compare(-2, -3), 1)
    assert.strictEqual(compare(-3, -2), -1)
  })

  it('should compare two bigints correctly', function (): void {
    assert.strictEqual(compare(2n, 3n), -1n)
    assert.strictEqual(compare(2n, 2n), 0n)
    assert.strictEqual(compare(2n, 1n), 1n)
    assert.strictEqual(compare(0n, 0n), 0n)
    assert.strictEqual(compare(-2n, 2n), -1n)
    assert.strictEqual(compare(-2n, -3n), 1n)
    assert.strictEqual(compare(-3n, -2n), -1n)
  })

  it('should compare two floating point numbers correctly', function (): void {
    // Infinity
    assert.strictEqual(
      compare(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY),
      0
    )
    assert.strictEqual(
      compare(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY),
      0
    )
    assert.strictEqual(
      compare(Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY),
      1
    )
    assert.strictEqual(
      compare(Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY),
      -1
    )
    assert.strictEqual(compare(Number.POSITIVE_INFINITY, 2.0), 1)
    assert.strictEqual(compare(2.0, Number.POSITIVE_INFINITY), -1)
    assert.strictEqual(compare(Number.NEGATIVE_INFINITY, 2.0), -1)
    assert.strictEqual(compare(2.0, Number.NEGATIVE_INFINITY), 1)
    // floating point numbers
    assert.strictEqual(compare(0.3 - 0.2, 0.1), 0)
  })

  it('should compare two booleans', function (): void {
    assert.strictEqual(compare(true, true), 0)
    assert.strictEqual(compare(true, false), 1)
    assert.strictEqual(compare(false, true), -1)
    assert.strictEqual(compare(false, false), 0)
  })

  it('should compare mixed numbers and booleans', function (): void {
    assert.strictEqual(compare(2, true), 1)
    assert.strictEqual(compare(0, true), -1)
    assert.strictEqual(compare(true, 2), -1)
    assert.strictEqual(compare(false, 2), -1)
  })

  it('should compare bignumbers', function (): void {
    assert.deepStrictEqual(compare(bignumber(2), bignumber(3)), bignumber(-1))
    assert.deepStrictEqual(compare(bignumber(2), bignumber(2)), bignumber(0))
    assert.deepStrictEqual(compare(bignumber(3), bignumber(2)), bignumber(1))
    assert.deepStrictEqual(compare(bignumber(0), bignumber(0)), bignumber(0))
    assert.deepStrictEqual(compare(bignumber(-2), bignumber(2)), bignumber(-1))
  })

  it('should compare mixed numbers and bignumbers', function (): void {
    assert.deepStrictEqual(compare(bignumber(2), 3), bignumber(-1))
    assert.deepStrictEqual(compare(2, bignumber(2)), bignumber(0))
  })

  it('should compare mixed numbers and bigints', function (): void {
    assert.deepStrictEqual(compare(2n, 3), -1)
    assert.deepStrictEqual(compare(2, 2n), 0)
  })

  it('should compare mixed bigints and bignumbers', function (): void {
    assert.deepStrictEqual(compare(bignumber(2), 3n), bignumber(-1))
    assert.deepStrictEqual(compare(2n, bignumber(2)), bignumber(0))
  })

  it('should compare mixed booleans and bignumbers', function (): void {
    assert.deepStrictEqual(compare(bignumber(0.1), true), bignumber(-1))
    assert.deepStrictEqual(compare(bignumber(1), true), bignumber(0))
    assert.deepStrictEqual(compare(bignumber(1), false), bignumber(1))
    assert.deepStrictEqual(compare(false, bignumber(0)), bignumber(0))
    assert.deepStrictEqual(compare(true, bignumber(0)), bignumber(1))
  })

  it('should compare two fractions', function (): void {
    const a = math.fraction(1, 3)
    const b = math.fraction(1, 6)
    assert(compare(a, b) instanceof math.Fraction)
    assert.strictEqual(a.toString(), '0.(3)')
    assert.strictEqual(b.toString(), '0.1(6)')

    assert.strictEqual(compare(math.fraction(3), math.fraction(2)).valueOf(), 1)
    assert.strictEqual(
      compare(math.fraction(2), math.fraction(3)).valueOf(),
      -1
    )
    assert.strictEqual(compare(math.fraction(3), math.fraction(3)).valueOf(), 0)

    assert.strictEqual(
      compare(
        math.add(math.fraction(0.1), math.fraction(0.2)),
        math.fraction(0.3)
      ).valueOf(),
      0
    ) // this would fail with numbers
  })

  it('should compare mixed fractions and numbers', function (): void {
    assert.deepStrictEqual(compare(1, math.fraction(1, 3)), math.fraction(1))
    assert.deepStrictEqual(compare(math.fraction(1, 3), 1), math.fraction(-1))
  })

  it('should compare mixed fractions and bigints', function (): void {
    assert.deepStrictEqual(compare(1n, math.fraction(1, 3)), math.fraction(1))
    assert.deepStrictEqual(compare(math.fraction(1, 3), 1n), math.fraction(-1))
  })

  it('should add two measures of the same unit', function (): void {
    assert.strictEqual(compare(unit('100cm'), unit('10inch')), 1)
    assert.strictEqual(compare(unit('99cm'), unit('1m')), -1)
    assert.strictEqual(compare(unit('1m'), unit('1m')), 0)
    assert.strictEqual(compare(unit('101cm'), unit('1m')), 1)
  })

  it('should throw an error if comparing a unit with a number', function (): void {
    assert.throws(function (): void {
      compare(unit('100cm'), 22)
    })
  })

  it('should throw an error for two measures of different units', function (): void {
    assert.throws(function (): void {
      compare(math.unit(5, 'km'), math.unit(100, 'gram'))
    })
  })

  it('should throw an error if comparing a unit with a bignumber', function (): void {
    assert.throws(function (): void {
      compare(unit('100cm'), bignumber(22))
    })
  })

  it('should compare two strings', function (): void {
    assert.strictEqual(compare('0', 0), 0)
    assert.strictEqual(compare('10', '2'), 1)
  })

  describe('Array', function (): void {
    it('should compare array - scalar', function (): void {
      assert.deepStrictEqual(compare(2, [1, 2, 3]), [1, 0, -1])
      assert.deepStrictEqual(compare([1, 2, 3], 2), [-1, 0, 1])
    })

    it('should compare array - array', function (): void {
      assert.deepStrictEqual(
        compare(
          [
            [1, 2, 0],
            [-1, 0, 2]
          ],
          [
            [3, -1, 0],
            [-2, 1, 0]
          ]
        ),
        [
          [-1, 1, 0],
          [1, -1, 1]
        ]
      )
    })

    it('should compare broadcastable arrays', function (): void {
      assert.deepStrictEqual(compare([[1, 3, 0]], [[3], [1]]), [
        [-1, 0, -1],
        [0, 1, -1]
      ])
    })

    it('should compare array - dense matrix', function (): void {
      assert.deepStrictEqual(
        compare(
          [
            [1, 2, 0],
            [-1, 0, 2]
          ],
          matrix([
            [3, -1, 0],
            [-2, 1, 0]
          ])
        ),
        matrix([
          [-1, 1, 0],
          [1, -1, 1]
        ])
      )
    })

    it('should compare array - sparse matrix', function (): void {
      assert.deepStrictEqual(
        compare(
          [
            [1, 2, 0],
            [-1, 0, 2]
          ],
          sparse([
            [3, -1, 0],
            [-2, 1, 0]
          ])
        ),
        matrix([
          [-1, 1, 0],
          [1, -1, 1]
        ])
      )
    })
  })

  describe('DenseMatrix', function (): void {
    it('should compare dense matrix - scalar', function (): void {
      assert.deepStrictEqual(compare(2, matrix([1, 2, 3])), matrix([1, 0, -1]))
      assert.deepStrictEqual(compare(matrix([1, 2, 3]), 2), matrix([-1, 0, 1]))
    })

    it('should compare dense matrix - array', function (): void {
      assert.deepStrictEqual(
        compare(
          matrix([
            [1, 2, 0],
            [-1, 0, 2]
          ]),
          [
            [3, -1, 0],
            [-2, 1, 0]
          ]
        ),
        matrix([
          [-1, 1, 0],
          [1, -1, 1]
        ])
      )
    })

    it('should compare dense matrix - dense matrix', function (): void {
      assert.deepStrictEqual(
        compare(
          matrix([
            [1, 2, 0],
            [-1, 0, 2]
          ]),
          matrix([
            [3, -1, 0],
            [-2, 1, 0]
          ])
        ),
        matrix([
          [-1, 1, 0],
          [1, -1, 1]
        ])
      )
    })

    it('should compare dense matrix - sparse matrix', function (): void {
      assert.deepStrictEqual(
        compare(
          matrix([
            [1, 2, 0],
            [-1, 0, 2]
          ]),
          sparse([
            [3, -1, 0],
            [-2, 1, 0]
          ])
        ),
        matrix([
          [-1, 1, 0],
          [1, -1, 1]
        ])
      )
    })
  })

  describe('SparseMatrix', function (): void {
    it('should compare sparse matrix - scalar', function (): void {
      assert.deepStrictEqual(
        compare(
          2,
          sparse([
            [1, 2],
            [3, 4]
          ])
        ),
        matrix([
          [1, 0],
          [-1, -1]
        ])
      )
      assert.deepStrictEqual(
        compare(
          sparse([
            [1, 2],
            [3, 4]
          ]),
          2
        ),
        matrix([
          [-1, 0],
          [1, 1]
        ])
      )
    })

    it('should compare sparse matrix - array', function (): void {
      assert.deepStrictEqual(
        compare(
          sparse([
            [1, 2, 0],
            [-1, 0, 2]
          ]),
          [
            [3, -1, 0],
            [-2, 1, 0]
          ]
        ),
        matrix([
          [-1, 1, 0],
          [1, -1, 1]
        ])
      )
    })

    it('should compare sparse matrix - dense matrix', function (): void {
      assert.deepStrictEqual(
        compare(
          sparse([
            [1, 2, 0],
            [-1, 0, 2]
          ]),
          matrix([
            [3, -1, 0],
            [-2, 1, 0]
          ])
        ),
        matrix([
          [-1, 1, 0],
          [1, -1, 1]
        ])
      )
    })

    it('should compare sparse matrix - sparse matrix', function (): void {
      assert.deepStrictEqual(
        compare(
          sparse([
            [1, 2, 0],
            [-1, 0, 2]
          ]),
          sparse([
            [3, -1, 0],
            [-2, 1, 0]
          ])
        ),
        sparse([
          [-1, 1, 0],
          [1, -1, 1]
        ])
      )
    })
  })

  it('should apply configuration option relTol', function (): void {
    const mymath = math.create()
    assert.strictEqual(mymath.compare(1, 0.991), 1)
    assert.strictEqual(
      mymath.compare(mymath.bignumber(1), mymath.bignumber(0.991)).valueOf(),
      '1'
    )

    mymath.config({ relTol: 1e-2 })
    assert.strictEqual(mymath.compare(1, 0.991), 0)
    assert.strictEqual(
      mymath.compare(mymath.bignumber(1), mymath.bignumber(0.991)).valueOf(),
      '0'
    )
  })

  it('should throw an error when comparing complex numbers', function (): void {
    assert.throws(function (): void {
      compare(complex(1, 1), complex(1, 2))
    }, TypeError)
    assert.throws(function (): void {
      compare(complex(2, 1), 3)
    }, TypeError)
    assert.throws(function (): void {
      compare(3, complex(2, 4))
    }, TypeError)
    assert.throws(function (): void {
      compare(math.bignumber(3), complex(2, 4))
    }, TypeError)
    assert.throws(function (): void {
      compare(complex(2, 4), math.bignumber(3))
    }, TypeError)
  })

  it('should throw an error if matrices are different sizes', function (): void {
    assert.throws(function (): void {
      compare([1, 4, 6], [3, 4])
    })
  })

  it('should throw an error in case of invalid number of arguments', function (): void {
    assert.throws(function (): void {
      compare(1)
    }, /TypeError: Too few arguments/)
    assert.throws(function (): void {
      compare(1, 2, 3)
    }, /TypeError: Too many arguments/)
  })

  it('should throw an error in case of invalid type of arguments', function (): void {
    assert.throws(function (): void {
      compare(2, null)
    }, /TypeError: Unexpected type of argument/)
  })

  it('should LaTeX compare', function (): void {
    const expression = math.parse('compare(1,2)')
    assert.strictEqual(
      expression.toTex(),
      '\\mathrm{compare}\\left(1,2\\right)'
    )
  })
})
