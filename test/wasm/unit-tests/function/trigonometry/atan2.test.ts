/**
 * Test for atan2 - AssemblyScript-friendly TypeScript
 */
// test atan2
interface MathNode {
  type: string
  toTex(): string
}

import assert from 'assert'

import math from '../../../../src/defaultInstance.ts'
import { approxDeepEqual } from '../../../../tools/approx.js'
const pi = math.pi
const complex = math.complex
const matrix = math.matrix
const sparse = math.sparse
const unit = math.unit
const divide = math.divide
const atan2 = math.atan2
const bigmath = math.create({ precision: 20 })
const Big = bigmath.bignumber
const atan2Big = bigmath.atan2

describe('atan2', function (): void {
  it('should calculate atan2 correctly', function (): void {
    assert.strictEqual(atan2(0, 0) / pi, 0)
    assert.strictEqual(atan2(0, 1) / pi, 0)
    assert.strictEqual(atan2(1, 1) / pi, 0.25)
    assert.strictEqual(atan2(1, 0) / pi, 0.5)
    assert.strictEqual(atan2(1, -1) / pi, 0.75)
    assert.strictEqual(atan2(0, -1) / pi, 1)
    assert.strictEqual(atan2(-1, -1) / pi, -0.75)
    assert.strictEqual(atan2(-1, 0) / pi, -0.5)
    assert.strictEqual(atan2(-1, 1) / pi, -0.25)
  })

  it('should calculate atan2 for booleans', function (): void {
    assert.strictEqual(atan2(true, true), 0.25 * pi)
    assert.strictEqual(atan2(true, false), 0.5 * pi)
    assert.strictEqual(atan2(false, true), 0)
    assert.strictEqual(atan2(false, false), 0)
  })

  it('should calculate atan2 with mixed numbers and booleans', function (): void {
    assert.strictEqual(atan2(1, true), 0.25 * pi)
    assert.strictEqual(atan2(1, false), 0.5 * pi)
    assert.strictEqual(atan2(true, 1), 0.25 * pi)
    assert.strictEqual(atan2(false, 1), 0)
  })

  it('should return the arctan of for bignumbers', function (): void {
    assert.deepStrictEqual(atan2Big(Big(0), Big(0)), Big(0))
    assert.deepStrictEqual(atan2Big(Big(0), Big(1)), Big(0))
    assert.deepStrictEqual(
      atan2Big(Big(1), Big(1)),
      Big('0.78539816339744830962')
    )
    assert.deepStrictEqual(
      atan2Big(Big(1), Big(0)),
      Big('1.5707963267948966192')
    )
    assert.deepStrictEqual(
      atan2Big(Big(1), Big(-1)),
      Big('2.3561944901923449288')
    )
    assert.deepStrictEqual(
      atan2Big(Big(0), Big(-1)),
      Big('3.1415926535897932385')
    )
    assert.deepStrictEqual(
      atan2Big(Big(-1), Big(-1)),
      Big('-2.3561944901923449288')
    )
    assert.deepStrictEqual(
      atan2Big(Big(-1), Big(0)),
      Big('-1.5707963267948966192')
    )
    assert.deepStrictEqual(
      atan2Big(Big(-1), Big(1)),
      Big('-0.78539816339744830962')
    )
  })

  it('should return the arctan of for mixed numbers and bignumbers', function (): void {
    assert.deepStrictEqual(atan2Big(1, Big(1)), Big('0.78539816339744830962'))
    assert.deepStrictEqual(atan2Big(Big(1), 1), Big('0.78539816339744830962'))
  })

  it('should return the arctan of for mixed bignumbers and booleans', function (): void {
    assert.deepStrictEqual(
      atan2Big(Big(1), true),
      Big('0.78539816339744830962')
    )
    assert.deepStrictEqual(
      atan2Big(Big(1), false),
      Big('1.5707963267948966192')
    )
    assert.deepStrictEqual(
      atan2Big(true, Big(1)),
      Big('0.78539816339744830962')
    )
    assert.deepStrictEqual(atan2Big(false, Big(1)), Big(0))
  })

  it('should throw an error if called with a complex', function (): void {
    assert.throws(function (): void {
      atan2(complex('2+3i'), complex('1-2i'))
    })
  })

  it('should throw an error if called with a string', function (): void {
    assert.throws(function (): void {
      atan2('string', 1)
    })
  })

  it('should throw an error if called with a unit', function (): void {
    assert.throws(function (): void {
      atan2(unit('5cm'), 1)
    })
  })

  describe('Array', function (): void {
    it('should calculate atan2 array - scalar', function (): void {
      assert.deepStrictEqual(
        divide(atan2(1, [1, -1, 0]), pi),
        [0.25, 0.75, 0.5]
      )
      assert.deepStrictEqual(divide(atan2([1, -1, 0], 1), pi), [0.25, -0.25, 0])
    })

    it('should calculate atan2 array - array', function (): void {
      assert.deepStrictEqual(
        divide(
          atan2(
            [
              [1, -1, 0],
              [1, -1, 0]
            ],
            [
              [-1, 0, 1],
              [1, 1, 1]
            ]
          ),
          pi
        ),
        [
          [0.75, -0.5, 0],
          [0.25, -0.25, 0]
        ]
      )
    })

    it('should calculate atan2 between broadcastable arrays', function (): void {
      assert.deepStrictEqual(divide(atan2([[1, -1, 0]], [[-1], [1]]), pi), [
        [0.75, -0.75, 1],
        [0.25, -0.25, 0]
      ])
      assert.deepStrictEqual(divide(atan2([[-1], [1]], [1, -1, 0]), pi), [
        [-0.25, -0.75, -0.5],
        [0.25, 0.75, 0.5]
      ])
    })

    it('should calculate atan2 array - dense matrix', function (): void {
      assert.deepStrictEqual(
        divide(
          atan2(
            [
              [1, -1, 0],
              [1, -1, 0]
            ],
            matrix([
              [-1, 0, 1],
              [1, 1, 1]
            ])
          ),
          pi
        ),
        matrix([
          [0.75, -0.5, 0],
          [0.25, -0.25, 0]
        ])
      )
    })

    it('should calculate atan2 array - sparse matrix', function (): void {
      assert.deepStrictEqual(
        divide(
          atan2(
            [
              [1, -1, 0],
              [1, -1, 0]
            ],
            sparse([
              [-1, 0, 1],
              [1, 1, 1]
            ])
          ),
          pi
        ),
        matrix([
          [0.75, -0.5, 0],
          [0.25, -0.25, 0]
        ])
      )
    })
  })

  describe('DenseMatrix', function (): void {
    it('should calculate atan2 dense matrix - scalar', function (): void {
      assert.deepStrictEqual(
        divide(atan2(1, matrix([1, -1, 0])), pi),
        matrix([0.25, 0.75, 0.5])
      )
      assert.deepStrictEqual(
        divide(atan2(matrix([1, -1, 0]), 1), pi),
        matrix([0.25, -0.25, 0])
      )
    })

    it('should calculate atan2 dense matrix - array', function (): void {
      assert.deepStrictEqual(
        divide(
          atan2(
            matrix([
              [1, -1, 0],
              [1, -1, 0]
            ]),
            [
              [-1, 0, 1],
              [1, 1, 1]
            ]
          ),
          pi
        ),
        matrix([
          [0.75, -0.5, 0],
          [0.25, -0.25, 0]
        ])
      )
    })

    it('should calculate atan2 dense matrix - dense matrix', function (): void {
      assert.deepStrictEqual(
        divide(
          atan2(
            matrix([
              [1, -1, 0],
              [1, -1, 0]
            ]),
            matrix([
              [-1, 0, 1],
              [1, 1, 1]
            ])
          ),
          pi
        ),
        matrix([
          [0.75, -0.5, 0],
          [0.25, -0.25, 0]
        ])
      )
    })

    it('should calculate atan2 dense matrix - sparse matrix', function (): void {
      assert.deepStrictEqual(
        divide(
          atan2(
            matrix([
              [1, -1, 0],
              [1, -1, 0]
            ]),
            sparse([
              [-1, 0, 1],
              [1, 1, 1]
            ])
          ),
          pi
        ),
        matrix([
          [0.75, -0.5, 0],
          [0.25, -0.25, 0]
        ])
      )
    })
  })

  describe('SparseMatrix', function (): void {
    it('should calculate atan2 sparse matrix - scalar', function (): void {
      assert.deepStrictEqual(
        divide(
          atan2(
            1,
            sparse([
              [1, -1],
              [0, 1]
            ])
          ),
          pi
        ),
        matrix([
          [0.25, 0.75],
          [0.5, 0.25]
        ])
      )
      assert.deepStrictEqual(
        divide(
          atan2(
            sparse([
              [1, -1],
              [0, 1]
            ]),
            1
          ),
          pi
        ),
        sparse([
          [0.25, -0.25],
          [0, 0.25]
        ])
      )
    })

    it('should calculate atan2 sparse matrix - array', function (): void {
      assert.deepStrictEqual(
        divide(
          atan2(
            sparse([
              [1, -1, 0],
              [1, -1, 0]
            ]),
            [
              [-1, 0, 1],
              [1, 1, 1]
            ]
          ),
          pi
        ),
        sparse([
          [0.75, -0.5, 0],
          [0.25, -0.25, 0]
        ])
      )
    })

    it('should calculate atan2 sparse matrix - dense matrix', function (): void {
      assert.deepStrictEqual(
        divide(
          atan2(
            sparse([
              [1, -1, 0],
              [1, -1, 0]
            ]),
            matrix([
              [-1, 0, 1],
              [1, 1, 1]
            ])
          ),
          pi
        ),
        sparse([
          [0.75, -0.5, 0],
          [0.25, -0.25, 0]
        ])
      )
    })

    it('should calculate atan2 sparse matrix - sparse matrix', function (): void {
      assert.deepStrictEqual(
        divide(
          atan2(
            sparse([
              [1, -1, 0],
              [1, -1, 0]
            ]),
            sparse([
              [-1, 0, 1],
              [1, 1, 1]
            ])
          ),
          pi
        ),
        sparse([
          [0.75, -0.5, 0],
          [0.25, -0.25, 0]
        ])
      )
    })
  })

  it('should calculate the atan2 element-wise for arrays and matrices', function (): void {
    // array, matrix, range
    approxDeepEqual(divide(atan2([1, 0, -1], [1, 0, -1]), pi), [0.25, 0, -0.75])
    approxDeepEqual(
      divide(atan2(matrix([1, 0, -1]), matrix([1, 0, -1])), pi),
      matrix([0.25, 0, -0.75])
    )
    assert.strictEqual(atan2(0, 2) / pi, 0)
    assert.strictEqual(atan2(0, -2) / pi, 1)
  })

  it('should throw an error in case of invalid number of arguments', function (): void {
    assert.throws(function (): void {
      atan2(1)
    }, /TypeError: Too few arguments/)
    assert.throws(function (): void {
      atan2(1, 2, 3)
    }, /TypeError: Too many arguments/)
  })

  it('should throw an error in case of invalid type of arguments', function (): void {
    assert.throws(function (): void {
      atan2(null)
    }, /TypeError: Unexpected type of argument/)
  })

  it('should LaTeX atan2', function (): void {
    const expression = math.parse('atan2(1,1)')
    assert.strictEqual(expression.toTex(), '\\mathrm{atan2}\\left(1,1\\right)')
  })
})
