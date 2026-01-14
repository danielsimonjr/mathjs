/**
 * Test for and - AssemblyScript-friendly TypeScript
 */
import assert from 'assert'

import math from '../../../../src/defaultInstance.ts'

interface MathNode {
  type: string
  toTex(): string
}
const bignumber = math.bignumber
const complex = math.complex
const matrix = math.matrix
const sparse = math.sparse
const unit = math.unit
const and = math.and

describe('and', function (): void {
  it('should and two numbers correctly', function (): void {
    assert.strictEqual(and(1, 1), true)
    assert.strictEqual(and(-1, 1), true)
    assert.strictEqual(and(-1, -1), true)
    assert.strictEqual(and(0, -1), false)
    assert.strictEqual(and(1, 0), false)
    assert.strictEqual(and(1, NaN), false)
    assert.strictEqual(and(NaN, 1), false)
    assert.strictEqual(and(1e10, 0.019209), true)
    assert.strictEqual(and(-1.0e-100, 1.0e-100), true)
    assert.strictEqual(and(Infinity, -Infinity), true)
  })

  it('should and two complex numbers', function (): void {
    assert.strictEqual(and(complex(1, 1), complex(1, 1)), true)
    assert.strictEqual(and(complex(0, 1), complex(1, 1)), true)
    assert.strictEqual(and(complex(1, 0), complex(1, 1)), true)
    assert.strictEqual(and(complex(1, 1), complex(0, 1)), true)
    assert.strictEqual(and(complex(1, 1), complex(1, 0)), true)
    assert.strictEqual(and(complex(1, 0), complex(1, 0)), true)
    assert.strictEqual(and(complex(0, 1), complex(0, 1)), true)
    assert.strictEqual(and(complex(0, 0), complex(1, 1)), false)
    assert.strictEqual(and(complex(0, 0), complex(0, 1)), false)
    assert.strictEqual(and(complex(0, 0), complex(1, 0)), false)
    assert.strictEqual(and(complex(1, 1), complex(0, 0)), false)
    assert.strictEqual(and(complex(0, 1), complex(0, 0)), false)
    assert.strictEqual(and(complex(1, 0), complex(0, 0)), false)
    assert.strictEqual(and(complex(), complex(1, 1)), false)
    assert.strictEqual(and(complex(0), complex(1, 1)), false)
    assert.strictEqual(and(complex(1), complex(1, 1)), true)
    assert.strictEqual(and(complex(1, 1), complex()), false)
    assert.strictEqual(and(complex(1, 1), complex(0)), false)
    assert.strictEqual(and(complex(1, 1), complex(1)), true)
  })

  it('should and mixed numbers and complex numbers', function (): void {
    assert.strictEqual(and(complex(1, 1), 1), true)
    assert.strictEqual(and(complex(1, 1), 0), false)
    assert.strictEqual(and(1, complex(1, 1)), true)
    assert.strictEqual(and(0, complex(1, 1)), false)
    assert.strictEqual(and(complex(0, 0), 1), false)
    assert.strictEqual(and(1, complex(0, 0)), false)
  })

  it('should and two booleans', function (): void {
    assert.strictEqual(and(true, true), true)
    assert.strictEqual(and(true, false), false)
    assert.strictEqual(and(false, true), false)
    assert.strictEqual(and(false, false), false)
  })

  it('should and mixed numbers and booleans', function (): void {
    assert.strictEqual(and(2, true), true)
    assert.strictEqual(and(2, false), false)
    assert.strictEqual(and(0, true), false)
    assert.strictEqual(and(true, 2), true)
    assert.strictEqual(and(false, 2), false)
  })

  it('should and bignumbers', function (): void {
    assert.strictEqual(and(bignumber(1), bignumber(1)), true)
    assert.strictEqual(and(bignumber(-1), bignumber(1)), true)
    assert.strictEqual(and(bignumber(-1), bignumber(-1)), true)
    assert.strictEqual(and(bignumber(0), bignumber(-1)), false)
    assert.strictEqual(and(bignumber(1), bignumber(0)), false)
    assert.strictEqual(and(bignumber(1), bignumber(NaN)), false)
    assert.strictEqual(and(bignumber(NaN), bignumber(1)), false)
    assert.strictEqual(and(bignumber('1e+10'), bignumber(0.19209)), true)
    assert.strictEqual(and(bignumber('-1.0e-100'), bignumber('1.0e-100')), true)
    assert.strictEqual(and(bignumber(Infinity), bignumber(-Infinity)), true)
  })

  it('should and bigints', function (): void {
    assert.strictEqual(and(1n, 1n), true)
    assert.strictEqual(and(-1n, 1n), true)
    assert.strictEqual(and(-1n, -1n), true)
    assert.strictEqual(and(0n, -1n), false)
    assert.strictEqual(and(1n, 0n), false)
  })

  it('should and mixed numbers and bignumbers', function (): void {
    assert.strictEqual(and(bignumber(2), 3), true)
    assert.strictEqual(and(2, bignumber(2)), true)
    assert.strictEqual(and(0, bignumber(2)), false)
    assert.strictEqual(and(2, bignumber(0)), false)
    assert.strictEqual(and(bignumber(0), 2), false)
    assert.strictEqual(and(bignumber(2), 0), false)
  })

  it('should and mixed numbers and bigints', function (): void {
    assert.strictEqual(and(2n, 3), true)
    assert.strictEqual(and(2, 2n), true)
    assert.strictEqual(and(0, 2n), false)
    assert.strictEqual(and(2, 0n), false)
    assert.strictEqual(and(0n, 2), false)
    assert.strictEqual(and(2n, 0), false)
  })

  it('should and two units', function (): void {
    assert.strictEqual(and(unit('100cm'), unit('10inch')), true)
    assert.strictEqual(and(unit('100cm'), unit('0 inch')), false)
    assert.strictEqual(and(unit('0cm'), unit('1m')), false)
    assert.strictEqual(and(unit('m'), unit('1m')), false)
    assert.strictEqual(and(unit('1dm'), unit('m')), false)
    assert.strictEqual(and(unit('-100cm'), unit('-10inch')), true)
    assert.strictEqual(and(unit(5, 'km'), unit(100, 'gram')), true)
    assert.strictEqual(and(unit(5, 'km'), unit(0, 'gram')), false)
    assert.strictEqual(and(unit(0, 'km'), unit(100, 'gram')), false)

    assert.strictEqual(
      and(unit(bignumber(0), 'm'), unit(bignumber(0), 'm')),
      false
    )
    assert.strictEqual(
      and(unit(bignumber(1), 'm'), unit(bignumber(0), 'm')),
      false
    )
    assert.strictEqual(
      and(unit(bignumber(0), 'm'), unit(bignumber(1), 'm')),
      false
    )
    assert.strictEqual(
      and(unit(bignumber(1), 'm'), unit(bignumber(1), 'm')),
      true
    )
  })

  describe('Array', function (): void {
    it('should and array - scalar', function (): void {
      assert.deepStrictEqual(and(10, [0, 2]), [false, true])
      assert.deepStrictEqual(and([0, 2], 10), [false, true])
    })

    it('should and array - array', function (): void {
      assert.deepStrictEqual(and([0, 1, 0, 12], [0, 0, 1, 22]), [
        false,
        false,
        false,
        true
      ])
      assert.deepStrictEqual(and([], []), [])
    })

    it('should and broadcastable arrays', function (): void {
      assert.deepStrictEqual(and([[0, 1, 0, 12]], [[0], [0], [1], [22]]), [
        [false, false, false, false],
        [false, false, false, false],
        [false, true, false, true],
        [false, true, false, true]
      ])
    })

    it('should and array - dense matrix', function (): void {
      assert.deepStrictEqual(
        and([0, 1, 0, 12], matrix([0, 0, 1, 22])),
        matrix([false, false, false, true])
      )
      assert.deepStrictEqual(and([], matrix([])), matrix([]))
    })

    it('should and array - sparse matrix', function (): void {
      assert.deepStrictEqual(
        and(
          [
            [0, 1],
            [0, 12]
          ],
          sparse([
            [0, 0],
            [1, 22]
          ])
        ),
        sparse([
          [false, false],
          [false, true]
        ])
      )
    })
  })

  describe('DenseMatrix', function (): void {
    it('should and dense matrix - scalar', function (): void {
      assert.deepStrictEqual(and(10, matrix([0, 2])), matrix([false, true]))
      assert.deepStrictEqual(and(matrix([0, 2]), 10), matrix([false, true]))
    })

    it('should and dense matrix - array', function (): void {
      assert.deepStrictEqual(
        and(matrix([0, 1, 0, 12]), [0, 0, 1, 22]),
        matrix([false, false, false, true])
      )
      assert.deepStrictEqual(and(matrix([]), []), matrix([]))
    })

    it('should and dense matrix - dense matrix', function (): void {
      assert.deepStrictEqual(
        and(matrix([0, 1, 0, 12]), matrix([0, 0, 1, 22])),
        matrix([false, false, false, true])
      )
      assert.deepStrictEqual(and(matrix([]), matrix([])), matrix([]))
    })

    it('should and dense matrix - sparse matrix', function (): void {
      assert.deepStrictEqual(
        and(
          matrix([
            [0, 1],
            [0, 12]
          ]),
          sparse([
            [0, 0],
            [1, 22]
          ])
        ),
        sparse([
          [false, false],
          [false, true]
        ])
      )
    })
  })

  describe('SparseMatrix', function (): void {
    it('should and sparse matrix - scalar', function (): void {
      assert.deepStrictEqual(
        and(10, sparse([[0], [2]])),
        sparse([[false], [true]])
      )
      assert.deepStrictEqual(
        and(sparse([[0], [2]]), 10),
        sparse([[false], [true]])
      )
    })

    it('should and sparse matrix - array', function (): void {
      assert.deepStrictEqual(
        and(
          sparse([
            [0, 1],
            [0, 12]
          ]),
          [
            [0, 0],
            [1, 22]
          ]
        ),
        sparse([
          [false, false],
          [false, true]
        ])
      )
    })

    it('should and sparse matrix - dense matrix', function (): void {
      assert.deepStrictEqual(
        and(
          sparse([
            [0, 1],
            [0, 12]
          ]),
          matrix([
            [0, 0],
            [1, 22]
          ])
        ),
        sparse([
          [false, false],
          [false, true]
        ])
      )
    })

    it('should and sparse matrix - sparse matrix', function (): void {
      assert.deepStrictEqual(
        and(
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
          [false, false],
          [false, true]
        ])
      )
    })
  })

  it('should throw an error in case of invalid number of arguments', function (): void {
    assert.throws(function (): void {
      and(1)
    }, /TypeError: Too few arguments/)
    assert.throws(function (): void {
      and(1, 2, 3)
    }, /TypeError: Too many arguments/)
  })

  it('should throw an error in case of invalid type of arguments', function (): void {
    assert.throws(function (): void {
      and(2, null)
    }, /TypeError: Unexpected type of argument/)
    assert.throws(function (): void {
      and(new Date(), true)
    }, /TypeError: Unexpected type of argument/)
    assert.throws(function (): void {
      and(true, new Date())
    }, /TypeError: Unexpected type of argument/)
    assert.throws(function (): void {
      and(true, undefined)
    }, /TypeError: Unexpected type of argument/)
    assert.throws(function (): void {
      and(undefined, true)
    }, /TypeError: Unexpected type of argument/)
  })

  it('should LaTeX and', function (): void {
    const expression = math.parse('and(1,2)')
    assert.strictEqual(expression.toTex(), '\\left(1\\wedge2\\right)')
  })
})
